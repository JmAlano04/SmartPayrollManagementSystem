<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PayrollRunSeeder extends Seeder
{
    public function run(): void
    {
        $employeeIds = DB::table('employees')->pluck('id');

        if ($employeeIds->isEmpty()) {
            $this->command->warn('Walang employees sa database. Patakbuhin muna ang EmployeeSeeder.');
            return;
        }

        // Kunin yung unang user bilang "gumawa/nag-approve" sa logs (kung meron)
        $userId = DB::table('users')->value('id');

        // 3 buwan na "paid" na payroll runs
        foreach ([3, 2, 1] as $monthsAgo) {
            $periodStart = now()->subMonths($monthsAgo)->startOfMonth()->format('Y-m-d');
            $periodEnd = now()->subMonths($monthsAgo)->endOfMonth()->format('Y-m-d');

            $runId = DB::table('payroll_runs')->insertGetId([
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'status' => 'paid',
                'created_by' => $userId,
                'approved_by' => $userId,
                'approved_at' => now()->subMonths($monthsAgo)->endOfMonth(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $totalNet = 0;
            $flaggedCount = 0;

            foreach ($employeeIds as $index => $employeeId) {
                $base = rand(3000, 6000);
                $overtime = rand(0, 300);
                $allowances = 450;
                $gross = $base + $overtime + $allowances;
                $tax = round($gross * 0.15, 2);
                $deductions = 50;
                $net = round($gross - $tax - $deductions, 2);

                // Deliberate na anomaly sa unang empleyado, sa pinaka-huling run lang —
                // para may makita agad kapag tine-test yung anomaly detection UI.
                $isAnomaly = $monthsAgo === 1 && $index === 0;
                if ($isAnomaly) {
                    $net = round($net * 1.4, 2);
                    $flaggedCount++;
                }

                DB::table('payslips')->insert([
                    'payroll_run_id' => $runId,
                    'employee_id' => $employeeId,
                    'base_pay' => $base,
                    'overtime_pay' => $overtime,
                    'allowances_total' => $allowances,
                    'gross_pay' => $gross,
                    'tax_amount' => $tax,
                    'other_deductions' => $deductions,
                    'net_pay' => $net,
                    'is_flagged_anomaly' => $isAnomaly,
                    'anomaly_reason' => $isAnomaly ? 'Net pay increase of 40% vs. trailing average.' : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $totalNet += $net;
            }

            DB::table('payroll_runs')->where('id', $runId)->update([
                'total_gross' => DB::table('payslips')->where('payroll_run_id', $runId)->sum('gross_pay'),
                'total_net' => $totalNet,
                'flagged_anomalies_count' => $flaggedCount,
            ]);

            // Audit trail para sa run na ito
            DB::table('payroll_run_logs')->insert([
                [
                    'payroll_run_id' => $runId,
                    'user_id' => $userId,
                    'action' => 'status_changed',
                    'from_status' => null,
                    'to_status' => 'draft',
                    'notes' => 'Payroll run created.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'payroll_run_id' => $runId,
                    'user_id' => $userId,
                    'action' => 'status_changed',
                    'from_status' => 'draft',
                    'to_status' => 'approved',
                    'notes' => 'Reviewed and approved.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'payroll_run_id' => $runId,
                    'user_id' => $userId,
                    'action' => 'status_changed',
                    'from_status' => 'approved',
                    'to_status' => 'paid',
                    'notes' => 'Payment processed.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        $this->command->info('Payroll runs seeded: ' . DB::table('payroll_runs')->count());
        $this->command->info('Payslips seeded: ' . DB::table('payslips')->count());
        $this->command->info('Logs seeded: ' . DB::table('payroll_run_logs')->count());
    }
}