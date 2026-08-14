<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
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



    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function salaryStructures()
    {
        return $this->hasMany(SalaryStructure::class);
    }
}
