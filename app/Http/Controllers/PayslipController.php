<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Services\PayslipsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayslipController extends Controller
{
    public function __construct(
        protected PayslipsService $payslipsService
    ) {}

    /**
     * Display payslips page.
     */
    public function index(Request $request)
    {
        $payrollRuns = PayrollRun::select(
            'id',
            'period_start',
            'period_end',
            'status'
        )
            ->orderByDesc('period_start')
            ->get()
            ->map(function ($payrollRun) {
                return [
                    'id' => $payrollRun->id,

                    'period_start' => $payrollRun->period_start
                        ? $payrollRun->period_start->format('M d, Y')
                        : null,

                    'period_end' => $payrollRun->period_end
                        ? $payrollRun->period_end->format('M d, Y')
                        : null,

                    'pay_date' => $payrollRun->pay_date
                        ? $payrollRun->pay_date->format('M d, Y')
                        : null,

                    'status' => $payrollRun->status,
                ];
            });

        return Inertia::render('payslips', [
            'stats' => $this->payslipsService->getStats(),

            'payslips' => $this->payslipsService->getPayslips(),

            'employees' => Employee::select(
                'id',
                'employee_code',
                'first_name',
                'last_name'
            )
                ->where('status', 'active')
                ->orderBy('last_name')
                ->get(),

            'payrollRuns' => $payrollRuns,
        ]);
    }

    /**
     * Generate a new payslip.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => [
                'required',
                'exists:employees,id',
            ],

            'payroll_run_id' => [
                'required',
                'exists:payroll_runs,id',
            ],

            'base_pay' => [
                'required',
                'numeric',
                'min:0',
            ],

            'overtime_pay' => [
                'required',
                'numeric',
                'min:0',
            ],

            'allowances_total' => [
                'required',
                'numeric',
                'min:0',
            ],

            'gross_pay' => [
                'required',
                'numeric',
                'min:0',
            ],

            'tax_amount' => [
                'required',
                'numeric',
                'min:0',
            ],

            'other_deductions' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        /**
         * Prevent duplicate payslip.
         */
        $existingPayslip = Payslip::where(
            'employee_id',
            $validated['employee_id']
        )
            ->where(
                'payroll_run_id',
                $validated['payroll_run_id']
            )
            ->exists();

        if ($existingPayslip) {
            return back()->withErrors([
                'employee_id' =>
                    'This employee already has a payslip for the selected pay period.',
            ]);
        }

        /**
         * Calculate net pay.
         *
         * Net Pay =
         * Gross Pay
         * - Tax
         * - Other Deductions
         */
        $netPay =
            (float) $validated['gross_pay']
            - (float) $validated['tax_amount']
            - (float) $validated['other_deductions'];

        /**
         * Prevent negative net pay.
         */
        $netPay = max(0, $netPay);

        /**
         * Generate payslip number.
         */
        $payslipNumber =
            'PS-'
            . now()->format('YmdHis')
            . '-'
            . $validated['employee_id'];

        /**
         * Create payslip.
         */
        Payslip::create([
            'payroll_run_id' =>
                $validated['payroll_run_id'],

            'employee_id' =>
                $validated['employee_id'],

            'payslip_number' =>
                $payslipNumber,

            'base_pay' =>
                $validated['base_pay'],

            'overtime_pay' =>
                $validated['overtime_pay'],

            'allowances_total' =>
                $validated['allowances_total'],

            'gross_pay' =>
                $validated['gross_pay'],

            'tax_amount' =>
                $validated['tax_amount'],

            'other_deductions' =>
                $validated['other_deductions'],

            'net_pay' =>
                $netPay,

            'is_flagged_anomaly' =>
                false,

            'anomaly_reason' =>
                null,

            'calculation_breakdown' => [
                'base_pay' => (float) $validated['base_pay'],
                'overtime_pay' => (float) $validated['overtime_pay'],
                'allowances_total' => (float) $validated['allowances_total'],
                'gross_pay' => (float) $validated['gross_pay'],
                'tax_amount' => (float) $validated['tax_amount'],
                'other_deductions' => (float) $validated['other_deductions'],
                'net_pay' => (float) $netPay,
            ],
        ]);

        return redirect()
            ->route('payslips.index')
            ->with(
                'success',
                'Payslip generated successfully.'
            );
    }
}