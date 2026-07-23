<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollRunLog extends Model
{
    protected $table = 'payroll_run_logs';

    protected $fillable = [
        'payroll_run_id', 'user_id', 'action', 'from_status', 'to_status', 'notes',
    ];

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }
}