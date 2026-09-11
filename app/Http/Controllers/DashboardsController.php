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

            // Stats for dashboard
            'stats' => [
                'employees' => Employee::count(),

                'payrollRuns' => PayrollRun::where('status', 'pending')
                    ->count(),

                'payslips' => Payslip::count(),

                'totalPayroll' => PayrollRun::where('status', 'paid')
                    ->sum('total_net'),
            ],

            // Recent employees
            'employees' => Employee::latest('created_at')
                ->take(5)
                ->get(),

            // Recent payroll runs
            'payRuns' => PayrollRun::latest()
                ->take(5)
                ->get(),

            // Recent payslips
            'payslips' => Payslip::latest()
                ->take(5)
                ->get(),

                // Payslips that need review
            // Only payslips flagged as anomalies are shown
            'needsReview' => Payslip::with('employee')
                ->where('is_flagged_anomaly', true)
                ->latest()
                ->take(5)
                ->get(),

                
            // Total net payroll from paid payroll runs
            'totalPayroll' => PayrollRun::where('status', 'paid')
                ->sum('total_net'),

            // Trend data for payroll chart
            'trend' => PayrollRun::query()
                ->where('status', 'paid')
                ->select([
                    'id',
                    'period_start',
                    'period_end',
                    'total_net',
                ])
                ->orderBy('period_start','asc')
                ->get(),
        ]);
    }
}