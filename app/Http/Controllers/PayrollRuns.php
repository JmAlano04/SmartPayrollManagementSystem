<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PayrollRuns extends Controller
{
    //
    public function index()
    {
        return view('payroll_runs.index');
    }
}
