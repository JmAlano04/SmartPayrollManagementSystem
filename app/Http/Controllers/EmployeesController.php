<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Payslip;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeesController extends Controller
{
    /**
     * One route (/dashboard), two dashboards:
     *  - employee            -> resources/js/pages/employee-dashboard.tsx (their own data only)
     *  - admin / hr_manager  -> resources/js/pages/dashboard.tsx (company-wide)
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->hasRole('employee') && ! $user->hasAnyRole(['admin', 'hr_manager'])) {
            return Inertia::render('employee.employeeDashboard', [
                'employee' => $this->employeeData($user),
            ]);
        }

        return $this->adminDashboard($request);
    }

    /**
     * Company-wide dashboard.
     * Paste your EXISTING dashboard code here unchanged (stats, payRuns, trend, needsReview).
     */
    private function adminDashboard(Request $request): Response
    {
        return Inertia::render('dashboard', [
            // 'stats'       => ...,
            // 'payRuns'     => ...,
            // 'trend'       => ...,
            // 'needsReview' => ...,
        ]);
    }

    /**
     * Everything the employee dashboard needs, limited to the logged-in employee.
     * Adjust model / column names to match your schema.
     */
    private function employeeData(User $user): array
    {
        $employee = Employee::query()->where('user_id', $user->id)->first();

        $emptyAttendance = [
            'present' => 0,
            'late' => 0,
            'absent' => 0,
            'on_leave' => 0,
            'hours_worked' => 0,
            'recent' => [],
            'days' => [],
        ];

        if (! $employee) {
            return [
                'employee_code' => null,
                'position' => null,
                'department' => null,
                'latestPayslip' => null,
                'payslips' => [],
                'attendance' => $emptyAttendance,
            ];
        }

        /* Payslips */

        $payslips = Payslip::query()
            ->where('employee_id', $employee->id)
            ->latest('id')
            ->limit(10)
            ->get();

        /* Attendance this month */

        $monthStart = now()->startOfMonth()->toDateString();

        $month = fn () => Attendance::query()
            ->where('employee_id', $employee->id)
            ->where('date', '>=', $monthStart);

        $counts = $month()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $recent = $month()
            ->latest('date')
            ->limit(5)
            ->get(['id', 'date', 'time_in', 'time_out', 'hours_worked', 'status']);

        // One entry per day with a record: powers the calendar on the dashboard.
        $days = $month()
            ->get(['date', 'status'])
            ->map(fn ($row) => [
                'date' => substr((string) $row->date, 0, 10),
                'status' => $row->status,
            ])
            ->values();

        return [
            'employee_code' => $employee->employee_code,
            'position' => $employee->position,
            'department' => $employee->department,

            'latestPayslip' => $payslips->first()?->only([
                'id', 'payslip_number', 'pay_period', 'pay_date', 'status',
                'base_pay', 'overtime_pay', 'allowances_total',
                'gross_pay', 'tax_amount', 'total_deductions', 'net_pay',
            ]),

            'payslips' => $payslips->map->only([
                'id', 'payslip_number', 'pay_period', 'pay_date', 'status', 'net_pay',
            ])->values(),

            'attendance' => [
                'present' => (int) ($counts['present'] ?? 0),
                'late' => (int) ($counts['late'] ?? 0),
                'absent' => (int) ($counts['absent'] ?? 0),
                'on_leave' => (int) ($counts['on_leave'] ?? 0),
                'hours_worked' => (float) $month()->sum('hours_worked'),
                'recent' => $recent,
                'days' => $days,
            ],
        ];
    }
}