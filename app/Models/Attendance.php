<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    // Table is singular in your DB, so Laravel's default ("attendances") would be wrong.
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
        'work_date'      => 'date:Y-m-d',
        'hours_worked'   => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'is_absent'      => 'boolean',
        'is_paid_leave'  => 'boolean',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}