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
    return Payslip::with([
        'employee',
        'payrollRun',
    ])
        ->latest()
        ->get()
        ->map(function ($payslip) {

            $employee = $payslip->employee;
            $payrollRun = $payslip->payrollRun;

            return [
                'id' => $payslip->id,

                'payslip_number' => $payslip->payslip_number,

                'employee_code' =>
                    $employee?->employee_code ?? 'N/A',

                'employee_name' =>
                    $employee?->full_name ?? 'N/A',

                'email' =>
                    $employee?->email ?? '',

                'department' =>
                    $employee?->department?->name ?? 'N/A',

                'position' =>
                    $employee?->position?->name ?? 'N/A',

                // PAY PERIOD
                'pay_period' =>
                    ($payrollRun?->pay_period_start &&
                     $payrollRun?->pay_period_end)
                        ? $payrollRun->pay_period_start->format('M d')
                            . ' - ' .
                            $payrollRun->pay_period_end->format('M d, Y')
                        : 'N/A',

                // PAY DATE
                'pay_date' =>
                    $payrollRun?->pay_date
                        ? $payrollRun->pay_date->format('M d, Y')
                        : 'N/A',

                'gross_pay' =>
                    (float) $payslip->gross_pay,

                'total_deductions' =>
                    (float) $payslip->total_deductions,

                'net_pay' =>
                    (float) $payslip->net_pay,

                // STATUS COMES FROM PAYROLL RUN
                'status' =>
                    $payrollRun?->status ?? 'draft',
            ];
        });
}
}