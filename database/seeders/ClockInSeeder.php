<?php

namespace Database\Seeders;

use App\Models\ClockIn;
use App\Models\Employee;
use Illuminate\Database\Seeder;

class ClockInSeeder extends Seeder
{
    public function run(): void
    {
        if (!class_exists(ClockIn::class)) {
            return;
        }

        $employees = Employee::all();

        foreach ($employees as $employee) {
            for ($i = 5; $i >= 0; $i--) {
                $day = now()->subDays($i);

                if ($day->isWeekend()) {
                    continue;
                }

                ClockIn::create([
                    'employee_id' => $employee->id,
                    'clocked_at' => $day->copy()->setTime(8, rand(0, 15)),
                    'type' => 'in',
                    'match_confidence' => round(rand(85, 99) / 100, 2),
                ]);

                ClockIn::create([
                    'employee_id' => $employee->id,
                    'clocked_at' => $day->copy()->setTime(17, rand(0, 15)),
                    'type' => 'out',
                    'match_confidence' => round(rand(85, 99) / 100, 2),
                ]);
            }
        }
    }
}
