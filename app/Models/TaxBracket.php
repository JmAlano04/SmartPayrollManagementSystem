<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaxBracket extends Model
{
    //
    protected $fillable = [
        'region',
        'min_income',
        'max_income',
        'rate_percent',
        'effective_from',
    ];
}
