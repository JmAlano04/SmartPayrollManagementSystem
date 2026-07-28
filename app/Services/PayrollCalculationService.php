<?php

namespace App\Services;

use App\Models\SalaryStructure;

class PayrollCalculationService
{
    public function calculate(
        SalaryStructure $salary,
        int $workingDays,
        int $absentDays,
        float $overtimeHours
    ): array {
        // Calculate the daily rate
        $dailyRate =
            $salary->base_salary / $workingDays;

        // Calculate the hourly rate
        $hourlyRate =
            $dailyRate / 8;

        // Calculate the deduction caused by absences
        $absenceDeduction =
            $dailyRate * $absentDays;

        // Calculate the base pay after absence deduction
        $basePay =
            $salary->base_salary - $absenceDeduction;

        // Calculate overtime pay
        $overtimePay =
            $hourlyRate
            * $overtimeHours
            * $salary->overtime_rate_multiplier;

        // Get allowances
        $housingAllowance =
            $salary->housing_allowance;

        $transportAllowance =
            $salary->transport_allowance;

        $otherAllowance =
            $salary->other_allowance;

        // Calculate gross pay
        $grossPay =
            $basePay
            + $overtimePay
            + $housingAllowance
            + $transportAllowance
            + $otherAllowance;

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

            'hourly_rate' => round(
                $hourlyRate,
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

            'overtime_hours' => $overtimeHours,

            'overtime_pay' => round(
                $overtimePay,
                2
            ),

            'housing_allowance' => round(
                $housingAllowance,
                2
            ),

            'transport_allowance' => round(
                $transportAllowance,
                2
            ),

            'other_allowance' => round(
                $otherAllowance,
                2
            ),

            'gross_pay' => round(
                $grossPay,
                2
            ),
        ];
    }
}