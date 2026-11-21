<?php

namespace Database\Seeders;

use Carbon\CarbonPeriod;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $employeeIds = DB::table('employees')->pluck('id');

        if ($employeeIds->isEmpty()) {
            $this->command->warn('No employees found. Please seed the employees table first.');
            return;
        }

        $periodStart = now()->subMonth()->startOfMonth();
        $periodEnd = now()->subMonth()->endOfMonth();

        $weekdays = CarbonPeriod::create($periodStart, $periodEnd)
            ->filter(fn ($date) => $date->isWeekday());

        foreach ($employeeIds as $employeeId) {
            foreach ($weekdays as $date) {
                $isAbsent = rand(1, 100) <= 5;       // 5% chance absent
                $isPaidLeave = !$isAbsent && rand(1, 100) <= 3; // 3% chance paid leave
                $overtimeHours = (!$isAbsent && !$isPaidLeave) ? rand(0, 2) : 0;

                $status = $isAbsent ? 'absent' : ($isPaidLeave ? 'on_leave' : 'present');
                $timeIn = ($isAbsent || $isPaidLeave) ? null : '08:00:00';
                $timeOut = ($isAbsent || $isPaidLeave) ? null : sprintf('%02d:00:00', 17 + $overtimeHours);
                $hoursWorked = ($isAbsent) ? 0 : 8;

                DB::table('attendance')->updateOrInsert(
                    ['employee_id' => $employeeId, 'work_date' => $date->format('Y-m-d')],
                    [
                        'time_in' => $timeIn,
                        'time_out' => $timeOut,
                        'hours_worked' => $hoursWorked,
                        'overtime_hours' => $overtimeHours,
                        'status' => $status,
                        'remarks' => $isAbsent ? 'No show' : ($isPaidLeave ? 'Paid leave' : null),
                        'is_absent' => $isAbsent,
                        'is_paid_leave' => $isPaidLeave,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        $this->command->info('Attendance sample data seeded: ' . DB::table('attendance')->count() . ' total rows.');
    }
}
