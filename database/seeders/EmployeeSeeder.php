<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\SalaryStructure;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    /**
     * Walang factory dependency dito (hindi ligtas i-assume na existing pa
     * ang EmployeeFactory/SalaryStructureFactory pagkatapos ng DB wipe) —
     * direktang gumagawa ng records gamit ang model create().
     */
    public function run(): void
    {
        $employees = [
            ['first_name' => 'Juan',  'last_name' => 'Dela Cruz', 'department' => 'IT',         'position' => 'Software Developer', 'base_salary' => 35000],
            ['first_name' => 'Maria', 'last_name' => 'Santos',    'department' => 'HR',         'position' => 'HR Officer',         'base_salary' => 28000],
            ['first_name' => 'Pedro', 'last_name' => 'Reyes',     'department' => 'Finance',    'position' => 'Accountant',         'base_salary' => 32000],
            ['first_name' => 'Ana',   'last_name' => 'Garcia',    'department' => 'IT',         'position' => 'QA Tester',          'base_salary' => 26000],
            ['first_name' => 'Jose',  'last_name' => 'Ramos',     'department' => 'Operations', 'position' => 'Operations Lead',    'base_salary' => 30000],
        ];

        foreach ($employees as $index => $data) {
            $code = 'EMP-' . str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT);
            $email = strtolower($data['first_name'] . '.' . $data['last_name'] . '@smartpayroll.test');

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $data['first_name'] . ' ' . $data['last_name'],
                    'password' => Hash::make('password'),
                ]
            );
            $user->syncRoles('employee');

            $employee = Employee::firstOrCreate(
                ['employee_code' => $code],
                [
                    'user_id' => $user->id,
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'email' => $email,
                    'department' => $data['department'],
                    'position' => $data['position'],
                    'hire_date' => now()->subYears(rand(1, 5))->subDays(rand(0, 300)),
                    'employment_type' => 'full_time',
                    'status' => 'active',
                ]
            );

            SalaryStructure::firstOrCreate(
                ['employee_id' => $employee->id, 'effective_from' => now()->subYear()->toDateString()],
                [
                    'base_salary' => $data['base_salary'],
                    'housing_allowance' => 2000,
                    'transport_allowance' => 1000,
                    'other_allowance' => 500,
                    'overtime_rate_multiplier' => 1.25,
                    'fixed_deductions' => 0,
                    'currency' => 'PHP',
                ]
            );
        }
    }
}
