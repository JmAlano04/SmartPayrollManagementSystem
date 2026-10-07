<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {
            margin: 0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, Arial, sans-serif; /* DejaVu Sans supports the ₱ symbol */
            font-size: 10px;
            color: #1a1a1a;
            background: #fff;
        }

        .page {
            width: 100%;
        }

        /* HEADER */

        .header {
            background: #16241c;
            color: white;
            padding: 24px 36px 18px;
            text-align: center;
        }

        .header .company {
            font-size: 9px;
            letter-spacing: 3px;
            text-transform: uppercase;
            opacity: 0.6;
            margin-bottom: 6px;
        }

        .header h1 {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 6px;
            text-transform: uppercase;
        }

        .header .run-number {
            margin-top: 8px;
            font-size: 10px;
            opacity: 0.55;
            font-family: 'Courier New', monospace;
        }

        .header .badge {
            display: inline-block;
            margin-top: 10px;
            padding: 3px 12px;
            border-radius: 999px;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .badge-paid    { background: #16a34a; color: white; }
        .badge-pending { background: #b98a2e; color: white; }
        .badge-draft   { background: #6b7280; color: white; }

        /* PERIOD BANNER */

        .period-banner {
            background: #b98a2e;
            color: white;
            padding: 10px 36px;
            width: 100%;
        }

        .period-banner table {
            width: 100%;
            border-collapse: collapse;
        }

        .period-banner td {
            width: 33.33%;
            vertical-align: top;
        }

        .period-banner td.center { text-align: center; }
        .period-banner td.right  { text-align: right; }

        .period-label {
            font-size: 9px;
            opacity: 0.75;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .period-value {
            font-size: 12px;
            font-weight: bold;
            margin-top: 2px;
        }

        /* SUMMARY CARDS */

        .summary-section {
            background: #f9f9f7;
            padding: 16px 36px;
            border-bottom: 1px solid #e5e5e5;
        }

        .summary-section table {
            width: 100%;
            border-collapse: collapse;
        }

        .summary-section td {
            width: 25%;
            vertical-align: top;
        }

        .summary-label {
            font-size: 9px;
            color: #aaa;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .summary-value {
            font-size: 14px;
            font-weight: bold;
            color: #16241c;
            margin-top: 3px;
        }

        .summary-value.deduction { color: #dc2626; }

        /* PAYSLIP TABLE */

        .section {
            padding: 16px 36px;
        }

        .section-title {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #aaa;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 1px dashed #e5e5e5;
        }

        table.payslips {
            width: 100%;
            border-collapse: collapse;
        }

        table.payslips thead {
            display: table-header-group; /* repeat header on every page */
        }

        table.payslips th {
            background: #16241c;
            color: white;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 7px 6px;
            text-align: left;
        }

        table.payslips th.num,
        table.payslips td.num {
            text-align: right;
        }

        table.payslips tr {
            page-break-inside: avoid;
        }

        table.payslips td {
            padding: 6px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 9px;
            color: #333;
        }

        table.payslips tbody tr:nth-child(even) td {
            background: #f9f9f7;
        }

        table.payslips td.num {
            font-family: 'Courier New', monospace;
            color: #1a1a1a;
        }

        table.payslips td.deduction {
            color: #dc2626;
        }

        table.payslips td .emp-name {
            font-weight: bold;
            color: #16241c;
        }

        table.payslips td .emp-meta {
            font-size: 8px;
            color: #aaa;
            margin-top: 1px;
        }

        table.payslips td.mono {
            font-family: 'Courier New', monospace;
            font-size: 8px;
            color: #888;
        }

        table.payslips tfoot td {
            border-top: 1px solid #ccc;
            border-bottom: none;
            padding-top: 9px;
            font-weight: bold;
            font-size: 10px;
            color: #1a1a1a;
            background: #fff;
        }

        table.payslips tfoot td.deduction {
            color: #dc2626;
        }

        /* TOTAL NET PAY */

        .net-pay-section {
            background: #16241c;
            color: white;
            padding: 18px 36px;
            text-align: center;
            page-break-inside: avoid;
        }

        .net-label {
            font-size: 9px;
            letter-spacing: 3px;
            text-transform: uppercase;
            opacity: 0.6;
        }

        .net-amount {
            font-size: 28px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            margin-top: 4px;
            color: #b98a2e;
        }

        /* FOOTER */

        .footer {
            padding: 12px 36px;
            text-align: center;
            background: #f9f9f7;
            border-top: 1px solid #e5e5e5;
            page-break-inside: avoid;
        }

        .footer p {
            font-size: 9px;
            color: #aaa;
            margin: 2px 0;
        }

        .footer .generated {
            font-family: 'Courier New', monospace;
            font-size: 9px;
            color: #ccc;
            margin-top: 6px;
        }
    </style>
</head>
<body>

@php
    $status      = $payrollRun->status ?? 'draft';
    $payDate     = $payrollRun->pay_date
        ? \Carbon\Carbon::parse($payrollRun->pay_date)->format('M d, Y')
        : 'N/A';

    $totalBase       = $payslips->sum('base_pay');
    $totalOvertime   = $payslips->sum('overtime_pay');
    $totalAllowances = $payslips->sum('allowances_total');
    $totalGross      = $payslips->sum('gross_pay');
    $totalTax        = $payslips->sum('tax_amount');
    $totalOther      = $payslips->sum('other_deductions');
    $totalDeductions = $totalTax + $totalOther;
    $totalNet        = $payslips->sum('net_pay');
@endphp

<div class="page">

    {{-- HEADER --}}
    <div class="header">
        <div class="company">Payroll System</div>
        <h1>Payroll Run Summary</h1>
        <div class="run-number">Run #{{ str_pad($payrollRun->id, 5, '0', STR_PAD_LEFT) }}</div>
        <div>
            <span class="badge badge-{{ $status }}">{{ ucfirst($status) }}</span>
        </div>
    </div>

    {{-- PERIOD BANNER --}}
    <div class="period-banner">
        <table>
            <tr>
                <td>
                    <div class="period-label">Pay Period</div>
                    <div class="period-value">{{ $period }}</div>
                </td>
                <td class="center">
                    <div class="period-label">Employees</div>
                    <div class="period-value">{{ $payslips->count() }}</div>
                </td>
                <td class="right">
                    <div class="period-label">Pay Date</div>
                    <div class="period-value">{{ $payDate }}</div>
                </td>
            </tr>
        </table>
    </div>

    {{-- SUMMARY --}}
    <div class="summary-section">
        <table>
            <tr>
                <td>
                    <div class="summary-label">Total Gross Pay</div>
                    <div class="summary-value">₱ {{ number_format($totalGross, 2) }}</div>
                </td>
                <td>
                    <div class="summary-label">Total Tax</div>
                    <div class="summary-value deduction">₱ {{ number_format($totalTax, 2) }}</div>
                </td>
                <td>
                    <div class="summary-label">Total Deductions</div>
                    <div class="summary-value deduction">₱ {{ number_format($totalDeductions, 2) }}</div>
                </td>
                <td>
                    <div class="summary-label">Total Net Pay</div>
                    <div class="summary-value">₱ {{ number_format($totalNet, 2) }}</div>
                </td>
            </tr>
        </table>
    </div>

    {{-- PAYSLIP BREAKDOWN --}}
    <div class="section">
        <div class="section-title">Employee Breakdown</div>

        <table class="payslips">
            <thead>
                <tr>
                    <th>Payslip No.</th>
                    <th>Employee</th>
                    <th class="num">Base Pay</th>
                    <th class="num">Overtime</th>
                    <th class="num">Allowances</th>
                    <th class="num">Gross Pay</th>
                    <th class="num">Tax</th>
                    <th class="num">Other Ded.</th>
                    <th class="num">Net Pay</th>
                </tr>
            </thead>

            <tbody>
                @foreach ($payslips as $payslip)
                    <tr>
                        <td class="mono">{{ $payslip->payslip_number }}</td>
                        <td>
                            <div class="emp-name">
                                {{ $payslip->employee?->first_name }} {{ $payslip->employee?->last_name }}
                            </div>
                            <div class="emp-meta">
                                {{ $payslip->employee?->employee_code ?? 'N/A' }}
                                &middot; {{ $payslip->employee?->department ?? 'N/A' }}
                                &middot; {{ $payslip->employee?->position ?? 'N/A' }}
                            </div>
                        </td>
                        <td class="num">₱ {{ number_format($payslip->base_pay, 2) }}</td>
                        <td class="num">₱ {{ number_format($payslip->overtime_pay, 2) }}</td>
                        <td class="num">₱ {{ number_format($payslip->allowances_total, 2) }}</td>
                        <td class="num">₱ {{ number_format($payslip->gross_pay, 2) }}</td>
                        <td class="num deduction">- ₱ {{ number_format($payslip->tax_amount, 2) }}</td>
                        <td class="num deduction">- ₱ {{ number_format($payslip->other_deductions, 2) }}</td>
                        <td class="num"><strong>₱ {{ number_format($payslip->net_pay, 2) }}</strong></td>
                    </tr>
                @endforeach
            </tbody>

            <tfoot>
                <tr>
                    <td colspan="2">Totals ({{ $payslips->count() }} employees)</td>
                    <td class="num">₱ {{ number_format($totalBase, 2) }}</td>
                    <td class="num">₱ {{ number_format($totalOvertime, 2) }}</td>
                    <td class="num">₱ {{ number_format($totalAllowances, 2) }}</td>
                    <td class="num">₱ {{ number_format($totalGross, 2) }}</td>
                    <td class="num deduction">- ₱ {{ number_format($totalTax, 2) }}</td>
                    <td class="num deduction">- ₱ {{ number_format($totalOther, 2) }}</td>
                    <td class="num">₱ {{ number_format($totalNet, 2) }}</td>
                </tr>
            </tfoot>
        </table>
    </div>

    {{-- TOTAL NET PAY --}}
    <div class="net-pay-section">
        <div class="net-label">Total Net Payout</div>
        <div class="net-amount">₱ {{ number_format($totalNet, 2) }}</div>
    </div>

    {{-- FOOTER --}}
    <div class="footer">
        <p>This is a system-generated payroll run summary.</p>
        <p>Please contact HR or Finance for any discrepancies.</p>
        <div class="generated">Generated: {{ now()->format('M d, Y h:i A') }}</div>
    </div>

</div>

</body>
</html>