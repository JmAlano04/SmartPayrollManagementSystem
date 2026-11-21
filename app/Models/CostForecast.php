<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CostForecast extends Model
{
    protected $fillable = [
        'period_start',
        'period_end',
        'horizon',
        'method',
        'projected_headcount',
        'projected_base_pay',
        'projected_overtime_pay',
        'projected_allowances',
        'projected_gross',
        'projected_tax',
        'projected_other_deductions',
        'projected_net',
        'lower_bound_net',
        'upper_bound_net',
        'confidence',
        'history_months',
        'assumptions',
        'breakdown',
        'generated_by',
        'generated_at',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'horizon' => 'integer',
            'projected_headcount' => 'integer',
            'projected_base_pay' => 'decimal:2',
            'projected_overtime_pay' => 'decimal:2',
            'projected_allowances' => 'decimal:2',
            'projected_gross' => 'decimal:2',
            'projected_tax' => 'decimal:2',
            'projected_other_deductions' => 'decimal:2',
            'projected_net' => 'decimal:2',
            'lower_bound_net' => 'decimal:2',
            'upper_bound_net' => 'decimal:2',
            'history_months' => 'integer',
            'assumptions' => 'array',
            'breakdown' => 'array',
            'generated_at' => 'datetime',
        ];
    }

    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}