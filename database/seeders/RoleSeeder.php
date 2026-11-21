<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // firstOrCreate = safe to run again and again (hindi mag-dduplicate)
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $hr = Role::firstOrCreate(['name' => 'hr_manager', 'guard_name' => 'web']);
        $employee = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);

        $permissions = [
            'view employees',
            'create employees',
            'edit employees',
            'delete employees',
            'view payroll',
            'create payroll',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $admin->syncPermissions(Permission::all());

        $hr->syncPermissions([
            'view employees',
            'create employees',
            'edit employees',
            'view payroll',
        ]);

        $employee->syncPermissions([
            'view payroll',
        ]);
    }
}
