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

            // ==========================================
            // DASHBOARD STATS
            // ==========================================
            'stats' => [

                // Total number of employees
                'employees' => Employee::count(),

                // Total pending payroll runs
                'payrollRuns' => PayrollRun::where('status', 'pending')
                    ->count(),

                // Total number of payslips
                'payslips' => Payslip::count(),

                // Total net payroll from paid payroll runs
                //
                // payroll_runs.status = paid
                // payslips.net_pay = actual net pay
                //
                'totalPayroll' => PayrollRun::query()
                    ->where('payroll_runs.status', 'paid')
                    ->join(
                        'payslips',
                        'payslips.payroll_run_id',
                        '=',
                        'payroll_runs.id'
                    )
                    ->sum('payslips.net_pay'),
            ],

            // ==========================================
            // RECENT EMPLOYEES
            // ==========================================
            'employees' => Employee::query()
                ->latest('created_at')
                ->take(5)
                ->get(),

            // ==========================================
            // RECENT PAYROLL RUNS
            // ==========================================
            //
            // IMPORTANT:
            // total_net does NOT come from payroll_runs.
            // It is calculated from payslips.net_pay.
            //
            'payRuns' => PayrollRun::query()
                ->select([
                    'payroll_runs.id',
                    'payroll_runs.period_start',
                    'payroll_runs.period_end',
                    'payroll_runs.status',
                ])
                ->selectRaw(
                    'COALESCE(SUM(payslips.net_pay), 0) AS total_net'
                )
                ->leftJoin(
                    'payslips',
                    'payslips.payroll_run_id',
                    '=',
                    'payroll_runs.id'
                )
                ->groupBy(
                    'payroll_runs.id',
                    'payroll_runs.period_start',
                    'payroll_runs.period_end',
                    'payroll_runs.status'
                )
                ->orderBy(
                    'payroll_runs.created_at',
                    'desc'
                )
                ->take(5)
                ->get(),

            // ==========================================
            // RECENT PAYSLIPS
            // ==========================================
            'payslips' => Payslip::query()
                ->latest()
                ->take(5)
                ->get(),

            // ==========================================
            // PAYSLIPS THAT NEED REVIEW
            // ==========================================
            //
            // Only flagged anomaly payslips
            //
            'needsReview' => Payslip::query()
                ->with('employee')
                ->where('is_flagged_anomaly', true)
                ->latest()
                ->take(5)
                ->get(),

            // ==========================================
            // PAYROLL TREND
            // ==========================================
            //
            // Calculates total net pay for every PAID
            // payroll run.
            //
            'trend' => PayrollRun::query()
                ->where('payroll_runs.status', 'paid')

                ->join(
                    'payslips',
                    'payslips.payroll_run_id',
                    '=',
                    'payroll_runs.id'
                )

                ->select([
                    'payroll_runs.id',
                    'payroll_runs.period_start',
                    'payroll_runs.period_end',
                ])

                ->selectRaw(
                    'COALESCE(SUM(payslips.net_pay), 0) AS total_net'
                )

                ->groupBy(
                    'payroll_runs.id',
                    'payroll_runs.period_start',
                    'payroll_runs.period_end'
                )

                ->orderBy(
                    'payroll_runs.period_start',
                    'asc'
                )

                ->get(),
        ]);
    }
}