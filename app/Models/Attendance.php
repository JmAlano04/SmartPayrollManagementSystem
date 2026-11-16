<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $table = 'attendance';

    protected $fillable = [
        'employee_id',
        'work_date',
        'time_in',
        'time_out',
        'hours_worked',
        'overtime_hours',
        'status',
        'remarks',
        'is_absent',
        'is_paid_leave',
    ];

    protected $casts = [
        'work_date' => 'date',
        'hours_worked' => 'float',
        'overtime_hours' => 'float',
        'is_absent' => 'boolean',
        'is_paid_leave' => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
