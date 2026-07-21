<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\SalaryStructure;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalaryStructureFactory extends Factory
{
    protected $model = SalaryStructure::class;

    public function definition(): array
    {
        $effectiveFrom = fake()->dateTimeBetween('-2 years', 'now');
        $effectiveTo   = fake()->optional()->dateTimeBetween($effectiveFrom, '+2 years');

        return [
          

            'base_salary'              => fake()->randomFloat(2, 15000, 80000),

            'housing_allowance'        => fake()->randomFloat(2, 0, 10000),

            'transport_allowance'      => fake()->randomFloat(2, 0, 5000),

            'other_allowance'          => fake()->randomFloat(2, 0, 3000),

            'overtime_rate_multiplier' => fake()->randomElement([1.25, 1.50, 1.75, 2.00]),

            'fixed_deductions'         => fake()->randomFloat(2, 0, 5000),

            'currency'                 => fake()->randomElement(['USD', 'PHP', 'EUR']),

            'effective_from'           => $effectiveFrom,

            'effective_to'             => $effectiveTo,
        ];
    }
}