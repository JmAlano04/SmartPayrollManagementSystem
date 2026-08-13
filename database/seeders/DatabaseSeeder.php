<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Employee;
use App\Models\Attendance;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\RolePermission;
use App\Models\SalaryStructure;



class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();



        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $this->call([

        // SEED THIS 1st for User Roles and Permissions
            //  RoleSeeder::class, 

        // SEED THIS 3rd for Attendance Sample Data after EmployeeSeeder is seeded
            //  AttendanceSeeder::class,
            
        // SEED THIS 4th for tax brackets after EmployeeSeeder is seeded
              TaxBracketSeeder::class,

        // SEED THIS 5th for Payroll Run after EmployeeSeeder is seeded
              PayrollRunSeeder::class,
        ]); 
     
        // SEED this 2nd for Users and Employees

            //  Employee::factory()
            // ->count(10)
            // ->create()
            // ->each(function ($employee) {
            //     SalaryStructure::factory()->create([
            //         'employee_id' => $employee->id,
            //     ]);
            // });
    }
}
