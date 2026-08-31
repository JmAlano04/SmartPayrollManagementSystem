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

            'gross_pay' => [
                'required',
                'numeric',
                'min:0',
            ],

            'total_deductions' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        // Calculate net pay
        $netPay =
            (float) $validated['gross_pay']
            - (float) $validated['total_deductions'];

        // Prevent duplicate payslip
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

        // Generate unique payslip number
        $payslipNumber =
            'PS-' . now()->format('YmdHis') . '-' . $validated['employee_id'];

        // Create payslip
        Payslip::create([
            'employee_id' => $validated['employee_id'],

            'payroll_run_id' => $validated['payroll_run_id'],

            'payslip_number' => $payslipNumber,

            'gross_pay' => $validated['gross_pay'],

            'other_deductions' => $validated['total_deductions'],

            'net_pay' => $netPay,
        ]);

        return redirect()
            ->route('payslips.index')
            ->with(
                'success',
                'Payslip generated successfully.'
            );
    }
}