<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryStructure extends Model
{
    //
        protected $fillable = [
            'employee_id',
            'basic_salary',
            'housing_allowance',
            'transport_allowance',
            'other_allowance',
            'overtime_rate_multiplier',
            'fixed_deductions',
            'currency',
            'effective_from',
            'effective_to',
        ];
}
