<?php

namespace App\Services;

use App\Models\PayrollRun;
use App\Models\Payslip;
use Illuminate\Support\Collection;

class PayrollService
{
    /**
     * Get payslip statistics.
     */
    public function getStats(): array
    {
        return [
            'total_payroll_runs' => PayrollRun::count(),

            'paid_payroll_runs' => PayrollRun::where('status', 'paid')->count(),

            'pending_payroll_runs' => PayrollRun::where('status', 'draft')->count(),
        ];
    }

    /**
     * Get all payroll runs for the index table.
     */
    public function getPayRuns(): Collection
    {
        return PayrollRun::withCount('payslips as employees_count')
            ->orderByDesc('created_at') // 'pay_date' isn't a confirmed real column — see note below
            ->get()
            ->map(function (PayrollRun $run) {

                return [
                    'id' => $run->id,

                    'name' => $run->name ?? 'N/A',

                    // PAY PERIOD — null-safe, same pattern as PayslipsService
                    'period_start' =>
                        $run->period_start
                            ? $run->period_start->format('M d, Y')
                            : 'N/A',

                    'period_end' =>
                        $run->period_end
                            ? $run->period_end->format('M d, Y')
                            : 'N/A',

                    // PAY DATE — null-safe; will show 'N/A' rather than crash
                    // if this column doesn't actually exist / is null
                    'pay_date' =>
                        $run->pay_date
                            ? $run->pay_date->format('M d, Y')
                            : 'N/A',

                    'employees_count' => $run->employees_count,

                    'gross_pay' => (float) ($run->total_gross ?? 0),

                    'net_pay' => (float) ($run->total_net ?? 0),

                    'status' => $run->status ?? 'draft',
                ];
            });
    }
}