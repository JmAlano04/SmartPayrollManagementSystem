<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    // The migration creates a singular table name.
    protected $table = 'attendance';

    protected $fillable = [
        'employee_id',
        'work_date',
        'hours_worked',
        'overtime_hours',
        'is_absent',
        'is_paid_leave',
    ];

    protected $casts = [
        'work_date'      => 'date',
        'hours_worked'   => 'float',
        'overtime_hours' => 'float',
        'is_absent'      => 'boolean',
        'is_paid_leave'  => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * There is no status column, so the status is derived from the flags.
     */
    public function getStatusAttribute(): string
    {
        if ($this->is_paid_leave) {
            return 'on_leave';
        }

        if ($this->is_absent) {
            return 'absent';
        }

        return 'present';
    }
}