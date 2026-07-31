<?php

namespace App\Services;

use App\Models\Payslip;
use App\Models\SalaryStructure;
use App\Services\TaxCalculatorService;

class PayrollCalculationService
{
    protected TaxCalculatorService $taxCalculator;


    // METHOD FOR CALCULATING PAYROLL
    public function __construct(
        TaxCalculatorService $taxCalculator
    ) {
        $this->taxCalculator = $taxCalculator;
    }

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

        // ==========================
        // Compute annual taxable income, tax, and net pay
        // ==========================

        // Convert monthly gross pay to annual taxable income
        $annualTaxableIncome =
            $grossPay * 12;

        // Compute tax
        $tax =
            $this->taxCalculator->calculate(
                $annualTaxableIncome
            );

        // Get fixed deductions
        $fixedDeductions =
            $salary->fixed_deductions;

        // Compute net pay
        $netPay =
            $grossPay
            - $tax
            - $fixedDeductions;

        // ==========================
        // Return the payroll calculation results
        // ==========================

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

            
            'annual_taxable_income' => round(
                $annualTaxableIncome,
                2
            ),

            
            'tax' => round(
                $tax,
                2
            ),

            
            'fixed_deductions' => round(
                $fixedDeductions,
                2
            ),

            
            'net_pay' => round(
                $netPay,
                2
            ),
        ];
    }

    //METHOD FOR GENERATING PAYSLIP
    public function generatePayslip(
    int $payrollRunId,
    SalaryStructure $salary,
    int $workingDays,
    int $absentDays,
    float $overtimeHours
    ): Payslip {

    // Compute payroll
    $result = $this->calculate(
        $salary,
        $workingDays,
        $absentDays,
        $overtimeHours
    );

    // Total allowances
    $allowancesTotal =
        $result['housing_allowance']
        + $result['transport_allowance']
        + $result['other_allowance'];

    // Save payslip
    return Payslip::create([
        'payroll_run_id' => $payrollRunId,
        'employee_id' => $salary->employee_id,

        'base_pay' => $result['base_pay'],
        'overtime_pay' => $result['overtime_pay'],
        'allowances_total' => $allowancesTotal,
        'gross_pay' => $result['gross_pay'],

        'tax_amount' => $result['tax'],
        'other_deductions' => $result['fixed_deductions'],

        'net_pay' => $result['net_pay'],

        'is_flagged_anomaly' => false,
        'anomaly_reason' => null,

        'calculation_breakdown' => $result,
    ]);
}
}