<?php

namespace App\Exports;

use App\Models\Payslip;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PayslipsExport implements FromCollection, WithHeadings, WithEvents
{
    public function __construct(
        protected ?string $search = null,
        protected ?string $status = null,
        protected ?string $payPeriod = null,
    ) {}

    /**
     * Get payslip data.
     */
    public function collection(): Collection
    {
        $query = Payslip::query()
            ->join(
                'employees',
                'payslips.employee_id',
                '=',
                'employees.id'
            )
            ->join(
                'payroll_runs',
                'payslips.payroll_run_id',
                '=',
                'payroll_runs.id'
            )
            ->select([
                'payslips.id as payslip_number',
                'employees.employee_code',
                'employees.first_name',
                'employees.last_name',

                'payroll_runs.period_start',
                'payroll_runs.period_end',

                'payslips.base_pay',
                'payslips.overtime_pay',
                'payslips.allowances_total',
                'payslips.gross_pay',
                'payslips.tax_amount',
                'payslips.other_deductions',
                'payslips.net_pay',
                'payroll_runs.status',
            ]);

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($this->search) {
            $search = strtolower($this->search);

            $query->where(function ($query) use ($search) {
                $query
                    ->whereRaw(
                        'LOWER(employees.first_name) LIKE ?',
                        ['%' . $search . '%']
                    )
                    ->orWhereRaw(
                        'LOWER(employees.last_name) LIKE ?',
                        ['%' . $search . '%']
                    )
                    ->orWhereRaw(
                        'LOWER(employees.employee_code) LIKE ?',
                        ['%' . $search . '%']
                    );
            });
        }

        /*
        |--------------------------------------------------------------------------
        | STATUS FILTER
        |--------------------------------------------------------------------------
        */

        if ($this->status) {
            $query->where(
                'payroll_runs.status',
                $this->status
            );
        }

        /*
        |--------------------------------------------------------------------------
        | PAY PERIOD FILTER
        |--------------------------------------------------------------------------
        */

        if ($this->payPeriod) {

            // Expected format:
            // 2026-09-01 - 2026-09-15

            [$start, $end] = explode(' - ', $this->payPeriod);

            $query
                ->where(
                    'payroll_runs.period_start',
                    $start
                )
                ->where(
                    'payroll_runs.period_end',
                    $end
                );
        }

        /*
        |--------------------------------------------------------------------------
        | EXPORT DATA
        |--------------------------------------------------------------------------
        */

        return $query
            ->orderBy('employees.last_name')
            ->get()
            ->map(function ($payslip) {

                return [
                    $payslip->payslip_number,
                    $payslip->employee_code,
                    $payslip->first_name . ' ' . $payslip->last_name,

                    $payslip->period_start .
                        ' - ' .
                        $payslip->period_end,


                    $payslip->base_pay,
                    $payslip->overtime_pay,
                    $payslip->allowances_total,
                    $payslip->gross_pay,
                    $payslip->tax_amount,
                    $payslip->other_deductions,
                    $payslip->net_pay,

                    ucfirst($payslip->status),
                ];
            });
    }

    /**
     * Excel headings.
     */
    public function headings(): array
    {
        return [
            'Payslip Number',
            'Employee Code',
            'Employee Name',
            'Pay Period',
            'base Pay',
            'Overtime Pay',
            'Allowances Total',
            'Gross Pay',
            'Tax Amount',
            'Other Deductions',
            'Net Pay',
            'Status',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | EVENTS
    |--------------------------------------------------------------------------
    */

    public function registerEvents(): array
    {
        return [

            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();

                /*
                |--------------------------------------------------------------------------
                | INSERT TITLE ROW
                |--------------------------------------------------------------------------
                */

                $sheet->insertNewRowBefore(1, 1);

                /*
                |--------------------------------------------------------------------------
                | TITLE
                |--------------------------------------------------------------------------
                */

                $sheet->mergeCells('A1:H1');

                $sheet->setCellValue(
                    'A1',
                    'PAYSLIP'
                );

                /*
                |--------------------------------------------------------------------------
                | TITLE STYLE
                |--------------------------------------------------------------------------
                */

                $sheet->getStyle('A1:L1')->applyFromArray([

                    'font' => [
                        'bold' => true,
                        'size' => 18,
                        'color' => [
                            'rgb' => 'FFFFFF',
                        ],
                    ],

                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => [
                            'rgb' => '003464',
                        ],
                    ],

                    'alignment' => [
                        'horizontal' =>
                            Alignment::HORIZONTAL_CENTER,

                        'vertical' =>
                            Alignment::VERTICAL_CENTER,
                    ],

                ]);

                /*
                |--------------------------------------------------------------------------
                | HEADER STYLE — ROW 2
                |--------------------------------------------------------------------------
                */

                $sheet->getStyle('A2:L2')->applyFromArray([

                    'font' => [
                        'bold' => true,
                        'color' => [
                            'rgb' => 'FFFFFF',
                        ],
                    ],

                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => [
                            'rgb' => '003464',
                        ],
                    ],

                    'alignment' => [
                        'horizontal' =>
                            Alignment::HORIZONTAL_CENTER,

                        'vertical' =>
                            Alignment::VERTICAL_CENTER,
                    ],

                ]);

                /*
                |--------------------------------------------------------------------------
                | DATA STYLE — ROW 3 ONWARDS
                |--------------------------------------------------------------------------
                */

                $highestRow = $sheet->getHighestRow();

                if ($highestRow >= 3) {

                    $sheet->getStyle(
                        "A3:H{$highestRow}"
                    )->applyFromArray([

                        'alignment' => [
                            'horizontal' =>
                                Alignment::HORIZONTAL_CENTER,

                            'vertical' =>
                                Alignment::VERTICAL_CENTER,
                        ],

                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | NUMBER FORMAT
                |--------------------------------------------------------------------------
                */

                if ($highestRow >= 3) {

                    // Gross Pay
                    $sheet
                        ->getStyle("E3:E{$highestRow}")
                        ->getNumberFormat()
                        ->setFormatCode('#,##0.00');

                    // Total Deductions
                    $sheet
                        ->getStyle("F3:F{$highestRow}")
                        ->getNumberFormat()
                        ->setFormatCode('#,##0.00');

                    // Net Pay
                    $sheet
                        ->getStyle("G3:G{$highestRow}")
                        ->getNumberFormat()
                        ->setFormatCode('#,##0.00');
                }

                /*
                |--------------------------------------------------------------------------
                | ROW HEIGHT
                |--------------------------------------------------------------------------
                */

                // Title
                $sheet
                    ->getRowDimension(1)
                    ->setRowHeight(30);

                // Header
                $sheet
                    ->getRowDimension(2)
                    ->setRowHeight(25);

                /*
                |--------------------------------------------------------------------------
                | AUTO-SIZE COLUMNS
                |--------------------------------------------------------------------------
                */

                foreach (range('A', 'H') as $column) {

                    $sheet
                        ->getColumnDimension($column)
                        ->setAutoSize(true);
                }

                /*
                |--------------------------------------------------------------------------
                | FREEZE HEADER
                |--------------------------------------------------------------------------
                */

                $sheet->freezePane('A3');
            },
        ];
    }
}