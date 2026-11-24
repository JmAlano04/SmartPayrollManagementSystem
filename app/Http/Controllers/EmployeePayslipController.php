<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Payslip;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeePayslipController extends Controller
{
    /**
     * Kunin ang Employee record ng naka-login na user.
     */
    protected function currentEmployee(Request $request): Employee
    {
        $user = $request->user();

        abort_if(! $user, 401, 'Authentication required.');

        $employee = Employee::query()
            ->where('user_id', '=', $user->id, 'and')
            ->first();

        if (! $employee && $user->email) {
            $employee = Employee::query()
                ->where('email', '=', $user->email, 'and')
                ->first();
        }

        abort_if(! $employee, 403, 'No employee record linked to this account.');

        return $employee;
    }

    /**
     * My Payslips page (sarili lang niya, "paid" payroll runs lang).
     */
    public function index(Request $request)
    {
        $employee = $this->currentEmployee($request);

        // Same rule as PayslipController@downloadAll: status comes from payroll run
        $base = Payslip::where('employee_id', $employee->id)
            ->whereHas('payrollRun', fn ($q) => $q->where('status', 'paid'));

        $payslips = (clone $base)
            ->with('payrollRun')
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function (Payslip $payslip) {
                $run = $payslip->payrollRun;

                return [
                    'id' => $payslip->id,
                    'payslip_number' => $payslip->payslip_number
                        ?: sprintf('PS-%06d', $payslip->id),
                    'pay_period' => $run
                        ? $run->period_start->format('M d, Y') . ' - ' . $run->period_end->format('M d, Y')
                        : '—',
                    'pay_date' => $run && $run->pay_date
                        ? $run->pay_date->format('M d, Y')
                        : null,
                    'base_pay' => (float) $payslip->base_pay,
                    'overtime_pay' => (float) $payslip->overtime_pay,
                    'allowances_total' => (float) $payslip->allowances_total,
                    'gross_pay' => (float) $payslip->gross_pay,
                    'tax_amount' => (float) $payslip->tax_amount,
                    'other_deductions' => (float) $payslip->other_deductions,
                    'total_deductions' => (float) $payslip->tax_amount + (float) $payslip->other_deductions,
                    'net_pay' => (float) $payslip->net_pay,
                    'status' => $run?->status ?? 'unknown',
                ];
            });

        return Inertia::render('employee/mypayslips', [
            'employee' => [
                'name' => $employee->first_name . ' ' . $employee->last_name,
                'employee_code' => $employee->employee_code,
            ],
            'stats' => [
                'total_payslips' => (clone $base)->count(),
                'latest_net_pay' => (float) ((clone $base)->latest('id')->value('net_pay') ?? 0),
                'ytd_net_pay' => (float) (clone $base)
                    ->whereYear('created_at', now()->year)
                    ->sum('net_pay'),
            ],
            'payslips' => $payslips,
        ]);
    }

    /**
     * Download own payslip PDF (paid lang).
     */
    public function download(Request $request, Payslip $payslip)
    {
        $employee = $this->currentEmployee($request);

        abort_if($payslip->employee_id !== $employee->id, 403);

        $payrollRun = $payslip->payrollRun;

        abort_if(! $payrollRun || $payrollRun->status !== 'paid', 403);

        $pdf = Pdf::loadView('receipt', [
            'payslip' => $payslip,
            'employee' => $employee,
            'payrollRun' => $payrollRun,
        ])->setPaper([0, 0, 420, 700]);

        $fileName = sprintf(
            'payslip-%s-%s.pdf',
            $employee->employee_code,
            $payslip->payslip_number
        );

        return response()->streamDownload(
            fn () => print($pdf->output()),
            $fileName,
            ['Content-Type' => 'application/pdf']
        );
    }
}