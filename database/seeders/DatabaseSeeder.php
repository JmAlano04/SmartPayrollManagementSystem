<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // 1st: roles & permissions (Spatie) — kailangan bago gumawa ng users
            RoleSeeder::class,

            // 2nd: admin/hr/employee login accounts
            UserSeeder::class,

            // 3rd: employees + salary structures
            EmployeeSeeder::class,

            // 4th: tax brackets (independent, pwede kahit saan pero dito na lang)
            TaxBracketSeeder::class,

            // 5th: attendance sample data (depende sa employees)
            AttendanceSeeder::class,

            // 6th: payroll runs, payslips, at logs (depende sa employees)
            PayrollRunSeeder::class,
        ]);
    }
}
