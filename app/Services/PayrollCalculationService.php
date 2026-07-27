<?php

namespace App\Services;

use App\Models\SalaryStructure;

class PayrollCalculationService
{
    public function calculate(
        SalaryStructure $salary,
        int $workingDays,
        int $absentDays
    ): array {
        // Calculate the daily rate
        $dailyRate =
            $salary->base_salary / $workingDays;

        // Calculate the deduction caused by absences
        $absenceDeduction =
            $dailyRate * $absentDays;

        // Calculate the base pay after absence deduction
        $basePay =
            $salary->base_salary - $absenceDeduction;

        return [
            'base_salary' => round(
                $salary->base_salary,
                2
            ),

            'working_days' => $workingDays,

            'daily_rate' => round(
                $dailyRate,
                2
            ),

            'absent_days' => $absentDays,

            'absence_deduction' => round(
                $absenceDeduction,
                2
            ),

            'base_pay' => round(
                $basePay,
                2
            ),
        ];
    }
}