<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\salarystructure;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;


class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
          Employee::factory()
            ->count(10)
            ->create()
            ->each(function ($employee) {
                SalaryStructure::factory()->create([
                    'employee_id' => $employee->id,
                ]);
            });
    }
    
}