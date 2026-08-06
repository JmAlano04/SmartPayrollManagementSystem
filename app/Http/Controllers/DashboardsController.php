<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Employee;
use App\Models\PayrollRun;
use App\Models\Payslip;

class DashboardsController extends Controller
{   

    
    public function index(Request $request)
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'employees'   => Employee::all()->count(),
                'payrollRuns' => PayrollRun::where('status', 'pending')->count(),
                'payslips'    => Payslip::count(),
                'totalPayroll' => Payslip::sum('net_pay'),
            ],
            
            'employees' => Employee::latest('created_at')->get(),
            'payRuns'   => PayrollRun::latest()->take(5)->get(),
            'payslips'  => Payslip::latest()->take(5)->get(),
            'totalPayroll' => PayrollRun::latest()->get(),
        ]);
    }
}