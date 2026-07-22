<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Employee;
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
         TaxBracketSeeder::class,
            //  RoleSeeder::class,
        // // /// UserSeeder::class,
        ]); 
     
   
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
