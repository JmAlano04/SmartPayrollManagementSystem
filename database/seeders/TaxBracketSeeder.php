<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaxBracketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Brackets below reflect the Philippines' BIR TRAIN law annual
     * income tax table, effective January 1, 2023 onward.
     * Adjust region, rates, and effective_from as needed for your
     * jurisdiction or for historical/future bracket changes.
     */
    public function run(): void
    {
        $effectiveFrom = '2023-01-01';

        $brackets = [
            [
                'region' => 'PH',
                'min_income' => 0,
                'max_income' => 250000,
                'rate_percent' => 0,
                'effective_from' => $effectiveFrom,
            ],
            [
                'region' => 'PH',
                'min_income' => 250000.01,
                'max_income' => 400000,
                'rate_percent' => 15,
                'effective_from' => $effectiveFrom,
            ],
            [
                'region' => 'PH',
                'min_income' => 400000.01,
                'max_income' => 800000,
                'rate_percent' => 20,
                'effective_from' => $effectiveFrom,
            ],
            [
                'region' => 'PH',
                'min_income' => 800000.01,
                'max_income' => 2000000,
                'rate_percent' => 25,
                'effective_from' => $effectiveFrom,
            ],
            [
                'region' => 'PH',
                'min_income' => 2000000.01,
                'max_income' => 8000000,
                'rate_percent' => 30,
                'effective_from' => $effectiveFrom,
            ],
            [
                'region' => 'PH',
                'min_income' => 8000000.01,
                'max_income' => null, // no upper bound
                'rate_percent' => 35,
                'effective_from' => $effectiveFrom,
            ],
        ];

        $now = now();

        foreach ($brackets as &$bracket) {
            $bracket['created_at'] = $now;
            $bracket['updated_at'] = $now;
        }

        // Avoid duplicate rows if the seeder is run more than once for
        // the same region/effective_from combination.
        DB::table('tax_bracket')
            ->where('region', 'PH')
            ->where('effective_from', $effectiveFrom)
            ->delete();

        DB::table('tax_bracket')->insert($brackets);
    }
}