<?php

namespace App\Services;

use App\Models\Payslip;

class PayslipsService
{
    /**
     * Get payslip statistics.
     */
    public function getStats(): array
    {
        return [
            'total_payslips' => Payslip::count(),

            'paid_payslips' => Payslip::whereHas(
                'payrollRun',
                function ($query) {
                    $query->where('status', 'paid');
                }
            )->count(),

            'pending_payslips' => Payslip::whereHas(
                'payrollRun',
                function ($query) {
                    $query->where('status', 'pending');
                }
            )->count(),

            'total_net_pay' => Payslip::sum('net_pay'),
        ];
    }

    /**
     * Get all payslips for admin page.
     */
    public function getPayslips()
    {
        $payslips = Payslip::with([
            'employee',
            'payrollRun',
        ])
            ->join(
                'employees',
                'payslips.employee_id',
                '=',
                'employees.id'
            )
            ->orderBy('employees.last_name', 'asc')
            ->select('payslips.*')
            ->paginate(10);

        $payslips->through(function ($payslip) {

            $employee = $payslip->employee;
            $payrollRun = $payslip->payrollRun;

            return [
                'id' => $payslip->id,

                'payslip_number' =>
                    $payslip->payslip_number,

                'employee_code' =>
                    $employee?->employee_code ?? 'N/A',

                'employee_firstname' =>
                    $employee?->first_name ?? 'N/A',

                'employee_lastname' =>
                    $employee?->last_name ?? 'N/A',

                'email' =>
                    $employee?->email ?? '',

                'department' =>
                    $employee?->department?->name ?? 'N/A',

                'position' =>
                    $employee?->position?->name ?? 'N/A',

                // PAY PERIOD
                'pay_period' =>
                    ($payrollRun?->period_start &&
                     $payrollRun?->period_end)
                        ? $payrollRun->period_start->format('M d')
                            . ' - ' .
                            $payrollRun->period_end->format('M d, Y')
                        : 'N/A',

                // PAY DATE
                'pay_date' =>
                    $payrollRun?->pay_date
                        ? $payrollRun->pay_date->format('M d, Y')
                        : 'N/A',

                'gross_pay' =>
                    (float) $payslip->gross_pay,

                'total_deductions' =>
                    (float) $payslip->other_deductions,

                'net_pay' =>
                    (float) $payslip->net_pay,

                // STATUS COMES FROM PAYROLL RUN
                'status' =>
                    $payrollRun?->status ?? 'draft',
            ];
        });

        return $payslips;
    }
}