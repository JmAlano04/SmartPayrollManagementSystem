<?php

namespace App\Imports;

use App\Models\Employee;
use App\Models\Payslip;
use App\Models\PayrollRun;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class PayslipsImport implements ToModel, WithHeadingRow
{
    /**
     * Row 1 = PAYSLIP
     * Row 2 = headings
     * Row 3 onwards = data
     */
    public function headingRow(): int
    {
        return 2;
    }

    public function model(array $row)
    {
        /*
        |--------------------------------------------------------------------------
        | EMPLOYEE
        |--------------------------------------------------------------------------
        */

        $employeeCode = trim(
            (string) ($row['employee_code'] ?? '')
        );

        if ($employeeCode === '') {
            return null;
        }

        // Existing employee only
        $employee = Employee::where(
            'employee_code',
            $employeeCode
        )->first();

        if (!$employee) {
            throw new \Exception(
                "Employee with code {$employeeCode} was not found."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | PAY PERIOD
        |--------------------------------------------------------------------------
        */

        $payPeriod = trim(
            (string) ($row['pay_period'] ?? '')
        );

        if ($payPeriod === '') {
            throw new \Exception(
                "Pay period is required for employee {$employeeCode}."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SPLIT PAY PERIOD
        |--------------------------------------------------------------------------
        */

        $periodParts = preg_split(
            '/\s+-\s+/',
            $payPeriod
        );

        if (
            !$periodParts ||
            count($periodParts) !== 2
        ) {
            throw new \Exception(
                "Invalid pay period format: {$payPeriod}"
            );
        }

        $periodStart = trim($periodParts[0]);
        $periodEnd = trim($periodParts[1]);

        /*
        |--------------------------------------------------------------------------
        | PAYROLL RUN
        |--------------------------------------------------------------------------
        */

        $payrollRun = PayrollRun::where(
            'period_start',
            $periodStart
        )
            ->where(
                'period_end',
                $periodEnd
            )
            ->first();

        if (!$payrollRun) {
            throw new \Exception(
                "Payroll run not found for period {$payPeriod}."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | AMOUNTS
        |--------------------------------------------------------------------------
        */

        $grossPay = $this->cleanAmount(
            $row['gross_pay'] ?? 0
        );

        $otherDeductions = $this->cleanAmount(
            $row['total_deductions'] ?? 0
        );

        $netPay = $this->cleanAmount(
            $row['net_pay'] ?? 0
        );

        /*
        |--------------------------------------------------------------------------
        | INSERT NEW PAYSLIP ONLY
        |--------------------------------------------------------------------------
        */

        return new Payslip([
            'employee_id' => $employee->id,
            'payroll_run_id' => $payrollRun->id,
            'gross_pay' => $grossPay,
            'other_deductions' => $otherDeductions,
            'net_pay' => $netPay,
        ]);
    }

    /**
     * Convert Excel amount to float.
     */
    private function cleanAmount($value): float
    {
        if ($value === null || $value === '') {
            return 0;
        }

        if (is_numeric($value)) {
            return (float) $value;
        }

        return (float) str_replace(
            [
                ',',
                '₱',
                'PHP',
                ' ',
            ],
            '',
            (string) $value
        );
    }
}