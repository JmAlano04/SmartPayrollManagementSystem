<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollRun extends Model
{
    use HasFactory;

    protected $table = 'payroll_runs';

    protected $fillable = [
        'period_start', 'period_end', 'status',
        'total_gross', 'total_net', 'flagged_anomalies_count',
        'created_by', 'approved_by', 'approved_at', 'pay_date',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'pay_date' => 'date',
    ];

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(PayrollRunLog::class);
    }
}