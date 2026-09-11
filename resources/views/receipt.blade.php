<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #1a1a1a;
            background: #fff;
        }

        /*
        |------------------------------------------------------------------
        | RECEIPT WRAPPER
        |------------------------------------------------------------------
        */

        .receipt {
            width: 100%;
            max-width: 580px;
            margin: 0 auto;
            padding: 0;
        }

        /*
        |------------------------------------------------------------------
        | HEADER
        |------------------------------------------------------------------
        */

        .header {
            background: #16241c;
            color: white;
            padding: 28px 30px 20px;
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
            font-size: 26px;
            font-weight: bold;
            letter-spacing: 6px;
            text-transform: uppercase;
        }

        .header .payslip-number {
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

        .badge-paid      { background: #16a34a; color: white; }
        .badge-pending   { background: #b98a2e; color: white; }
        .badge-draft     { background: #6b7280; color: white; }

        /*
        |------------------------------------------------------------------
        | EMPLOYEE INFO
        |------------------------------------------------------------------
        */

        .employee-section {
            background: #f9f9f7;
            padding: 18px 30px;
            border-bottom: 1px solid #e5e5e5;
        }

        .employee-section .label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            margin-bottom: 2px;
        }

        .employee-section .name {
            font-size: 16px;
            font-weight: bold;
            color: #16241c;
        }

        .employee-section .meta {
            margin-top: 10px;
            display: table;
            width: 100%;
        }

        .employee-section .meta-item {
            display: table-cell;
            width: 33.33%;
        }

        .employee-section .meta-label {
            font-size: 9px;
            color: #aaa;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .employee-section .meta-value {
            font-size: 11px;
            font-weight: bold;
            color: #333;
            margin-top: 2px;
        }

        /*
        |------------------------------------------------------------------
        | PAY PERIOD BANNER
        |------------------------------------------------------------------
        */

        .period-banner {
            background: #b98a2e;
            color: white;
            padding: 10px 30px;
            display: table;
            width: 100%;
        }

        .period-banner .period-left {
            display: table-cell;
        }

        .period-banner .period-right {
            display: table-cell;
            text-align: right;
        }

        .period-banner .period-label {
            font-size: 9px;
            opacity: 0.75;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .period-banner .period-value {
            font-size: 12px;
            font-weight: bold;
            margin-top: 2px;
        }

        /*
        |------------------------------------------------------------------
        | PAY BREAKDOWN
        |------------------------------------------------------------------
        */

        .section {
            padding: 16px 30px;
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

        .line-item {
            display: table;
            width: 100%;
            padding: 5px 0;
            border-bottom: 1px solid #f5f5f5;
        }

        .line-item .line-label {
            display: table-cell;
            color: #555;
            font-size: 11px;
        }

        .line-item .line-amount {
            display: table-cell;
            text-align: right;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #1a1a1a;
        }

        .line-item.deduction .line-amount {
            color: #dc2626;
        }

        .line-item.subtotal {
            margin-top: 6px;
            padding-top: 8px;
            border-top: 1px solid #ccc;
            border-bottom: none;
        }

        .line-item.subtotal .line-label,
        .line-item.subtotal .line-amount {
            font-weight: bold;
            color: #1a1a1a;
            font-size: 12px;
        }

        /*
        |------------------------------------------------------------------
        | DIVIDER
        |------------------------------------------------------------------
        */

        .divider {
            border: none;
            border-top: 1px dashed #ccc;
            margin: 0 30px;
        }

        /*
        |------------------------------------------------------------------
        | NET PAY
        |------------------------------------------------------------------
        */

        .net-pay-section {
            background: #16241c;
            color: white;
            padding: 20px 30px;
            text-align: center;
        }

        .net-pay-section .net-label {
            font-size: 9px;
            letter-spacing: 3px;
            text-transform: uppercase;
            opacity: 0.6;
        }

        .net-pay-section .net-amount {
            font-size: 30px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            margin-top: 4px;
            color: #b98a2e;
        }

        /*
        |------------------------------------------------------------------
        | FOOTER
        |------------------------------------------------------------------
        */

        .footer {
            padding: 14px 30px;
            text-align: center;
            background: #f9f9f7;
            border-top: 1px solid #e5e5e5;
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

<div class="receipt">

    {{-- ================================================================
    | HEADER
    ================================================================= --}}

    <div class="header">

        <div class="company">Payroll System</div>

        <h1>Payslip</h1>

        <div class="payslip-number">{{ $payslip->payslip_number }}</div>

        <div>
            <span class="badge badge-{{ $payrollRun->status ?? 'draft' }}">
                {{ ucfirst($payrollRun->status ?? 'Draft') }}
            </span>
        </div>

    </div>

    {{-- ================================================================
    | EMPLOYEE INFO
    ================================================================= --}}

    <div class="employee-section">

        <div class="label">Employee</div>

        <div class="name">
            {{ $employee->first_name }} {{ $employee->last_name }}
        </div>

        <div class="meta">

            <div class="meta-item">
                <div class="meta-label">Code</div>
                <div class="meta-value">{{ $employee->employee_code }}</div>
            </div>

            <div class="meta-item">
                <div class="meta-label">Department</div>
                <div class="meta-value">{{ $employee->department ?? 'N/A' }}</div>
            </div>

            <div class="meta-item">
                <div class="meta-label">Position</div>
                <div class="meta-value">{{ $employee->position ?? 'N/A' }}</div>
            </div>

        </div>

    </div>

    {{-- ================================================================
    | PAY PERIOD
    ================================================================= --}}

    <div class="period-banner">

        <div class="period-left">
            <div class="period-label">Pay Period</div>
            <div class="period-value">
                {{ $payrollRun->period_start->format('M d') }}
                —
                {{ $payrollRun->period_end->format('M d, Y') }}
            </div>
        </div>

        <div class="period-right">
            <div class="period-label">Pay Date</div>
            <div class="period-value">
                {{ $payrollRun->pay_date?->format('M d, Y') ?? 'N/A' }}
            </div>
        </div>

    </div>

    {{-- ================================================================
    | EARNINGS
    ================================================================= --}}

    <div class="section">

        <div class="section-title">Earnings</div>

        <div class="line-item">
            <div class="line-label">Base Pay</div>
            <div class="line-amount">₱ {{ number_format($payslip->base_pay, 2) }}</div>
        </div>

        <div class="line-item">
            <div class="line-label">Overtime Pay</div>
            <div class="line-amount">₱ {{ number_format($payslip->overtime_pay, 2) }}</div>
        </div>

        <div class="line-item">
            <div class="line-label">Allowances</div>
            <div class="line-amount">₱ {{ number_format($payslip->allowances_total, 2) }}</div>
        </div>

        <div class="line-item subtotal">
            <div class="line-label">Gross Pay</div>
            <div class="line-amount">₱ {{ number_format($payslip->gross_pay, 2) }}</div>
        </div>

    </div>

    <hr class="divider">

    {{-- ================================================================
    | DEDUCTIONS
    ================================================================= --}}

    <div class="section">

        <div class="section-title">Deductions</div>

        <div class="line-item deduction">
            <div class="line-label">Tax</div>
            <div class="line-amount">- ₱ {{ number_format($payslip->tax_amount, 2) }}</div>
        </div>

        <div class="line-item deduction">
            <div class="line-label">Other Deductions</div>
            <div class="line-amount">- ₱ {{ number_format($payslip->other_deductions, 2) }}</div>
        </div>

        <div class="line-item subtotal deduction">
            <div class="line-label">Total Deductions</div>
            <div class="line-amount">
                - ₱ {{ number_format($payslip->tax_amount + $payslip->other_deductions, 2) }}
            </div>
        </div>

    </div>

    {{-- ================================================================
    | NET PAY
    ================================================================= --}}

    <div class="net-pay-section">
        <div class="net-label">Net Pay</div>
        <div class="net-amount">₱ {{ number_format($payslip->net_pay, 2) }}</div>
    </div>

    {{-- ================================================================
    | FOOTER
    ================================================================= --}}

    <div class="footer">
        <p>This is a system-generated payslip.</p>
        <p>Please contact HR for any discrepancies.</p>
        <div class="generated">Generated: {{ now()->format('M d, Y h:i A') }}</div>
    </div>

</div>

</body>
</html>