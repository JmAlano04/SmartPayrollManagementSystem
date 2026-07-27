<?php

namespace App\Services;

use App\Models\TaxBracket;

class TaxCalculatorService
{
    public function calculate(float $annualTaxableIncome): float
    {
        $bracket = TaxBracket::where(
            'min_income',
            '<=',
            $annualTaxableIncome, 'and'
        )
        ->where(function ($query) use ($annualTaxableIncome) {
            $query->whereNull('max_income')
                ->orWhere(
                    'max_income',
                    '>',
                    $annualTaxableIncome
                );
        })
        ->orderBy('min_income', 'desc')
        ->first();

        if (!$bracket) {
            return 0;
        }

        if ($bracket->rate_percent == 0) {
            return 0;
        }

        $excessIncome =
            $annualTaxableIncome - $bracket->min_income;

        $tax = $excessIncome
            * ($bracket->rate_percent / 100);

        return round($tax, 2);
    }
}