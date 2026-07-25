<?php

namespace App\Services;

use App\Models\TaxBracket;


class TaxCalculatorService
{
    public function calculate(float $grossIncome, string $region = 'default'): float
    {
        $brackets = TaxBracket::where('region', '=', $region, 'and')
            ->orderBy('min_income', 'asc')
            ->get();

        if ($brackets->isEmpty()) {
            return round($grossIncome * 0.10, 2); // fallback flat rate
        }

        $totalTax = 0.0;

        foreach ($brackets as $bracket) {
            $ceiling = $bracket->max_income ?? INF;
            $taxableInBracket = min(max($grossIncome - $bracket->min_income, 0), $ceiling - $bracket->min_income);

            if ($taxableInBracket <= 0) {
                continue;
            }

            $totalTax += $taxableInBracket * ($bracket->rate_percent / 100);
        }

        return round($totalTax, 2);
    }
}