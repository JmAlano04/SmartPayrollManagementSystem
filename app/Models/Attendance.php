<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    //
    protected $fillable = [
        'employee_id',
        'work_date',
        'hours_worked',
        'overtime_hours',
        'is_absent',
        'is_paid_leave',
    ];
}
