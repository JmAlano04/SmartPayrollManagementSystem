<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\salary_structures;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            'Engineering' => [4500, 8000],
            'Sales' => [3200, 6000],
            'Support' => [2800, 4500],
            'Operations' => [3000, 5200],
        ];

        $i = 1;

        foreach ($departments as $department => [$minSalary, $maxSalary]) {
            // A handful of employees per department is enough to exercise anomaly detection and forecasting.
            for ($n = 0; $n < 5; $n++) {
                $code = sprintf('EMP-%04d', $i++);

                $user = User::create([
                    'name' => fake()->name(),
                    'email' => Str::lower(str_replace(' ', '.', $code)) . '@example.com',
                    'password' => bcrypt('password'),
                ]);

                [$firstName, $lastName] = explode(' ', $user->name, 2) + ['', ''];

                $employee = Employee::create([
                    'user_id' => $user->id,
                    'employee_code' => $code,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $user->email,
                    'department' => $department,
                    'position' => fake()->jobTitle(),
                    'hire_date' => fake()->dateTimeBetween('-3 years', '-2 months'),
                    'employment_type' => 'full_time',
                    'status' => 'active',
                    
                ]);

            }
        }
    }
}