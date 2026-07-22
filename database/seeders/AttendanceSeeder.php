<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\CarbonPeriod;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $employeeIds = DB::table('employees')->pluck('id');

        if ($employeeIds->isEmpty()) {
            $this->command->warn('Walang employees sa database. Patakbuhin muna ang EmployeeSeeder.');
            return;
        }

        $periodStart = now()->subMonth()->startOfMonth();
        $periodEnd = now()->subMonth()->endOfMonth();

        $weekdays = CarbonPeriod::create($periodStart, $periodEnd)
            ->filter(fn ($date) => $date->isWeekday());

        foreach ($employeeIds as $employeeId) {
            foreach ($weekdays as $date) {
                $isAbsent = rand(1, 100) <= 5; // 5% chance absent

                DB::table('attendance')->updateOrInsert(
                    ['employee_id' => $employeeId, 'work_date' => $date->format('Y-m-d')],
                    [
                        'hours_worked' => $isAbsent ? 0 : 8,
                        'overtime_hours' => $isAbsent ? 0 : rand(0, 2),
                        'is_absent' => $isAbsent,
                        'is_paid_leave' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        $this->command->info('Attendance sample data seeded: ' . DB::table('attendance')->count() . ' total rows.');
    }
}