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
        return [
            'user_id' => User::factory(),

            'employee_code' => 'EMP-' . fake()->unique()->numerify('####'),

            'first_name' => fake()->firstName(),

            'last_name' => fake()->lastName(),

            'email' => fake()->unique()->safeEmail(),

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
}