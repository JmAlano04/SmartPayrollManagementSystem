<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Attendance;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    /** @use HasFactory<\Database\Factories\EmployeeFactory> */
    use HasFactory;
    

     protected $fillable = [
        'user_id',
        'employee_code',
        'first_name',
        'last_name',
        'email',
        'department',
        'position',
        'hire_date',
        'employment_type',
        'status',
    ];

    // HasMany relationship with SalaryStructure model
    public function salaryStructures()
    {
        return $this->hasMany(SalaryStructure::class);
    }

    // BelongsTo relationship with User model
    public function User()
    {
        return $this->belongsTo(User::class);
    }

    public function Attendances()
    {
        return $this->hasMany(Attendance::class);
    }


}
