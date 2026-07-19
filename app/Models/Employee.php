<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function salaryStructures()
    {
        return $this->hasMany(SalaryStructure::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
