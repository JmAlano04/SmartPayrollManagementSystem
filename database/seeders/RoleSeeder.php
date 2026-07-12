<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Create Roles
        $admin      = Role::create(['name' => 'admin']);
        $hr         = Role::create(['name' => 'hr_manager']);
        $employee   = Role::create(['name' => 'employee']);

        // Create Permissions
        Permission::create(['name' => 'view employees']);
        Permission::create(['name' => 'create employees']);
        Permission::create(['name' => 'edit employees']);
        Permission::create(['name' => 'delete employees']);
        Permission::create(['name' => 'view payroll']);
        Permission::create(['name' => 'create payroll']);

        // Assign Permissions to Roles
        $admin->givePermissionTo(Permission::all());

        $hr->givePermissionTo([
            'view employees',
            'create employees',
            'edit employees',
        ]);

    
        $employee->givePermissionTo([
            'view payroll',
        ]);
    }
}