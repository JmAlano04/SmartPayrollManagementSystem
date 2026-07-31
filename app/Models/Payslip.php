<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payslip extends Model
{
    use HasFactory;

    protected $table = 'payslips';

    protected $fillable = [
        'payroll_run_id', 'employee_id', 'base_pay', 'overtime_pay',
        'allowances_total', 'gross_pay', 'tax_amount', 'other_deductions',
        'net_pay', 'is_flagged_anomaly', 'anomaly_reason', 'calculation_breakdown',
    ];

    protected $casts = [
        'is_flagged_anomaly' => 'boolean',
        'calculation_breakdown' => 'array',
    ];

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}