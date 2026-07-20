<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        $user      = User::factory()->create();
        $nameParts = explode(' ', $user->name);

        return [
            'user_id' => $user->id,

            'employee_code' => 'EMP-' . fake()->unique()->numerify('####'),

            'first_name' => $nameParts[0],                       // ← from User
            'last_name'  => $nameParts[1] ?? fake()->lastName(), // ← from User
            'email'      => $user->email,                        // ← from User

            'department' => fake()->randomElement([
                'IT',
                'HR',
                'Finance',
                'Marketing',
                'Operations',
            ]),

            'position' => fake()->randomElement([
                'Software Developer',
                'HR Officer',
                'Accountant',
                'IT Support',
                'Manager',
            ]),

            'hire_date' => fake()->date(),

            'employment_type' => fake()->randomElement([
                'full_time',
                'part_time',
                'contract',
            ]),

            'status' => fake()->randomElement([
                'active',
                'on_leave',
                'terminated',
            ]),

            'face_descriptor' => null,

            'face_enrolled_at' => null,
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (Employee $employee) {
           $role = fake()->randomElement(['employee', 'hr_manager', 'admin']);
           $employee->user->assignRole($role);
        });
    }
}