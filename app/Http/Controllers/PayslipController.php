<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Exports\PayslipsExport;
use Maatwebsite\Excel\Facades\Excel;
use App\Services\PayslipsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Imports\PayslipsImport;
use Barryvdh\DomPDF\Facade\Pdf;
use ZipArchive;


class PayslipController extends Controller
{
    public function __construct(
        protected PayslipsService $payslipsService
    ) {}

    /**
     * ============================================================
     * EMPLOYEE HELPERS
     * ============================================================
     *
     * Employee-side user = naka-login na user na ang role ay "employee".
     * Kung iba ang paraan mo ng pag-check ng role (Spatie, is_admin, atbp.),
     * palitan lang ang isEmployeeUser().
     */
    protected function isEmployeeUser(Request $request): bool
    {
        $user = $request->user();

        return $user && ($user->role ?? null) === 'employee';
    }

    /**
     * Kunin ang Employee record ng naka-login na user.
     */
    protected function currentEmployee(Request $request): Employee
    {
        $user = $request->user();

        abort_if(! $user, 401, 'Authentication required.');

        $employee = Employee::where('user_id', '=', $user->id, 'and')->first();

        if (! $employee && $user->email) {
            $employee = Employee::where('email', '=', $user->email, 'and')->first();
        }

        abort_if(! $employee, 403, 'No employee record linked to this account.');

        return $employee;
    }

    /**
     * Bawal sa employee ang admin actions.
     */
    protected function denyEmployee(Request $request): void
    {
        abort_if($this->isEmployeeUser($request), 403);
    }

    /**
     * My Payslips page (sarili lang niyang payslips, "paid" lang).
     */
    protected function employeeIndex(Request $request)
    {
        $employee = $this->currentEmployee($request);

        $base = Payslip::where('employee_id', $employee->id)
            ->whereHas('payrollRun', fn ($query) => $query->where('status', 'paid'));

        $payslips = (clone $base)
            ->with('payrollRun')
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function (Payslip $payslip) {
                $run = $payslip->payrollRun;

                return [
                    'id' => $payslip->id,
                    'payslip_number' => $payslip->payslip_number
                        ?: sprintf('PS-%06d', $payslip->id),
                    'pay_period' => $run
                        ? $run->period_start->format('M d, Y') . ' - ' . $run->period_end->format('M d, Y')
                        : '—',
                    'pay_date' => $run && $run->pay_date
                        ? $run->pay_date->format('M d, Y')
                        : null,
                    'base_pay' => (float) $payslip->base_pay,
                    'overtime_pay' => (float) $payslip->overtime_pay,
                    'allowances_total' => (float) $payslip->allowances_total,
                    'gross_pay' => (float) $payslip->gross_pay,
                    'total_deductions' => (float) $payslip->tax_amount + (float) $payslip->other_deductions,
                    'net_pay' => (float) $payslip->net_pay,
                    'status' => $payslip->status,
                ];
            });

        return Inertia::render('employee/mypayslips', [
            'employee' => [
                'name' => $employee->first_name . ' ' . $employee->last_name,
                'employee_code' => $employee->employee_code,
            ],
            'stats' => [
                'total_payslips' => (clone $base)->count(),
                'latest_net_pay' => (float) ((clone $base)->latest('id')->value('net_pay') ?? 0),
                'ytd_net_pay' => (float) (clone $base)
                    ->whereYear('created_at', now()->year)
                    ->sum('net_pay'),
            ],
            'payslips' => $payslips,
        ]);
    }

    /**
     * Display payslips page.
     * Employee -> sarili lang niyang payslips. Admin/HR -> lahat.
     */
    public function index(Request $request)
    {
        if ($this->isEmployeeUser($request)) {
            return $this->employeeIndex($request);
        }

        $payrollRuns = PayrollRun::select(
            'id',
            'period_start',
            'period_end',
            'status'
        )
            ->orderByDesc('period_start')
            ->get()
            ->map(function ($payrollRun) {
                return [
                    'id' => $payrollRun->id,

                    'period_start' => $payrollRun->period_start
                        ? $payrollRun->period_start->format('M d, Y')
                        : null,

                    'period_end' => $payrollRun->period_end
                        ? $payrollRun->period_end->format('M d, Y')
                        : null,

                    'pay_date' => $payrollRun->pay_date
                        ? $payrollRun->pay_date->format('M d, Y')
                        : null,

                    'status' => $payrollRun->status,
                ];
            });


        
        return Inertia::render('payslips', [
            'stats' => $this->payslipsService->getStats(),

            'payslips' => $this->payslipsService->getPayslips(),

            'employees' => Employee::select(
                'id',
                'employee_code',
                'first_name',
                'last_name'
            )
                ->where('status', 'active')
                ->orderBy('last_name', 'asc')
                ->get(),

            'payrollRuns' => $payrollRuns,
        ]);
    }

    /**
     * Generate a new payslip.
     */
    public function store(Request $request)
    {
        $this->denyEmployee($request);

        $validated = $request->validate([
            'employee_id' => [
                'required',
                'exists:employees,id',
            ],

            'payroll_run_id' => [
                'required',
                'exists:payroll_runs,id',
            ],

            'base_pay' => [
                'required',
                'numeric',
                'min:0',
            ],

            'overtime_pay' => [
                'required',
                'numeric',
                'min:0',
            ],

            'allowances_total' => [
                'required',
                'numeric',
                'min:0',
            ],

            'gross_pay' => [
                'required',
                'numeric',
                'min:0',
            ],

            'tax_amount' => [
                'required',
                'numeric',
                'min:0',
            ],

            'other_deductions' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        /**
         * Prevent duplicate payslip.
         */
        $existingPayslip = Payslip::where(
            'employee_id',
            $validated['employee_id']
        )
            ->where(
                'payroll_run_id',
                $validated['payroll_run_id']
            )
            ->exists();

        if ($existingPayslip) {
            return back()->withErrors([
                'employee_id' =>
                    'This employee already has a payslip for the selected pay period.',
            ]);
        }

        /**
         * Calculate net pay.
         *
         * Net Pay =
         * Gross Pay
         * - Tax
         * - Other Deductions
         */
        $netPay =
            (float) $validated['gross_pay']
            - (float) $validated['tax_amount']
            - (float) $validated['other_deductions'];

        /**
         * Prevent negative net pay.
         */
        $netPay = max(0, $netPay);

        /**
         * Generate payslip number.
         */
        $payslipNumber =
            'PS-'
            . now()->format('YmdHis')
            . '-'
            . $validated['employee_id'];

        /**
         * Create payslip.
         */
        Payslip::create([
            'payroll_run_id' =>
                $validated['payroll_run_id'],

            'employee_id' =>
                $validated['employee_id'],

            'payslip_number' =>
                $payslipNumber,

            'base_pay' =>
                $validated['base_pay'],

            'overtime_pay' =>
                $validated['overtime_pay'],

            'allowances_total' =>
                $validated['allowances_total'],

            'gross_pay' =>
                $validated['gross_pay'],

            'tax_amount' =>
                $validated['tax_amount'],

            'other_deductions' =>
                $validated['other_deductions'],

            'net_pay' =>
                $netPay,

            'is_flagged_anomaly' =>
                false,

            'anomaly_reason' =>
                null,

            'calculation_breakdown' => [
                'base_pay' => (float) $validated['base_pay'],
                'overtime_pay' => (float) $validated['overtime_pay'],
                'allowances_total' => (float) $validated['allowances_total'],
                'gross_pay' => (float) $validated['gross_pay'],
                'tax_amount' => (float) $validated['tax_amount'],
                'other_deductions' => (float) $validated['other_deductions'],
                'net_pay' => (float) $netPay,
            ],
        ]);

        return redirect()
            ->route('payslips.index')
            ->with(
                'success',
                'Payslip generated successfully.'
            );
    }

    public function update(Request $request, Payslip $payslip)
    {
        $this->denyEmployee($request);

        $employee = $payslip->employee;
        $payrollRun = $payslip->payrollRun;

        // Make sure the payslip has related data
        if (!$employee || !$payrollRun) {
            return back()->withErrors([
                'error' => 'Payslip data is incomplete.',
            ]);
        }

        // Validate submitted data
        $validated = $request->validate([
            'base_pay' => ['required', 'numeric', 'min:0'],
            'overtime_pay' => ['nullable', 'numeric', 'min:0'],
            'allowances_total' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'total_deductions' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'in:draft,under_review,paid'],
        ]);

        // Convert empty values to 0
        $basePay = (float) ($validated['base_pay'] ?? 0);
        $overtimePay = (float) ($validated['overtime_pay'] ?? 0);
        $allowances = (float) ($validated['allowances_total'] ?? 0);
        $tax = (float) ($validated['tax_amount'] ?? 0);
        $deductions = (float) ($validated['total_deductions'] ?? 0);

        // Calculate Gross Pay
        $grossPay = $basePay + $overtimePay + $allowances;

        // Calculate Net Pay
        $netPay = max($grossPay - $tax - $deductions, 0);

        // Update payslip
        $payslip->update([
            'base_pay' => $basePay,
            'overtime_pay' => $overtimePay,
            'allowances_total' => $allowances,
            'gross_pay' => $grossPay,
            'tax_amount' => $tax,
            'other_deductions' => $deductions,
            'net_pay' => $netPay,
            'status' => $validated['status'],
        ]);

        return redirect()
            ->route('payslips.index')
            ->with('success', 'Payslip updated successfully.');
    }

    public function destroy(Request $request, Payslip $payslip)
    {
        $this->denyEmployee($request);

        DB::table($payslip->getTable())
            ->where($payslip->getKeyName(), $payslip->getKey())
            ->delete();

        return redirect()
            ->back()
            ->with('success', 'Payslip Deleted successfully');
    }

    // Export payslips to Excel
    public function export(Request $request)
    {
        $this->denyEmployee($request);

        return Excel::download(
            new PayslipsExport(
                $request->input('search'),
                $request->input('status'),
                $request->input('pay_period'),
            ),
            'payslips.xlsx'
        );
    }

    // Download all payslips as a zip file
    public function downloadAll(Request $request)
    {
        $this->denyEmployee($request);

        $query = Payslip::with(['employee', 'payrollRun'])
            ->join('employees', 'payslips.employee_id', '=', 'employees.id')
            ->select('payslips.*')
            ->whereHas('payrollRun', fn ($q) => $q->where('status', 'paid'));

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('employees.first_name',      'like', "%{$search}%")
                ->orWhere('employees.last_name',     'like', "%{$search}%")
                ->orWhere('employees.employee_code', 'like', "%{$search}%");
            });
        }

        if ($request->status) {
            $status = $request->status;
            $query->whereHas('payrollRun', fn ($q) => $q->where('status', $status));
        }

        if ($request->pay_period) {
            [$start, $end] = explode(' - ', $request->pay_period);
            $query->whereHas('payrollRun', function ($q) use ($start, $end) {
                $q->where('period_start', trim($start))
                ->where('period_end',   trim($end));
            });
        }

        $payslips = $query->orderBy('employees.last_name')->get();

        if ($payslips->isEmpty()) {
            return back()->withErrors(['error' => 'No payslips found.']);
        }

        // Temp directory
        $tempDir = storage_path('app/temp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        // Create ZIP
        $zipFileName = 'payslips-' . now()->format('Y-m-d-His') . '.zip';
        $zipPath     = $tempDir . '/' . $zipFileName;

        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        foreach ($payslips as $payslip) {
            $employee   = $payslip->employee;
            $payrollRun = $payslip->payrollRun;

            if (!$employee || !$payrollRun) continue;

            $pdf = Pdf::loadView('receipt', compact(
                'payslip',
                'employee',
                'payrollRun'
            ))->setPaper([0, 0, 420, 700]);

            $fileName = "payslip-{$employee->employee_code}-{$payslip->payslip_number}.pdf";
            $zip->addFromString($fileName, $pdf->output());
        }

        $zip->close();

        return response()
            ->download($zipPath, $zipFileName)
            ->deleteFileAfterSend(true);
    }

    public function downloadPayslip(Request $request, Payslip $payslip)
    {
        // Employee: sarili at "paid" na payslip lang ang pwedeng i-download
        if ($this->isEmployeeUser($request)) {
            $me = $this->currentEmployee($request);

            abort_if($payslip->employee_id !== $me->id, 403);
            abort_if($payslip->status !== 'paid', 403);
        }

        $employee = $payslip->employee;
        $payrollRun = $payslip->payrollRun;

        if (!$employee || !$payrollRun) {
            return back()->withErrors([
                'error' => 'Payslip data is incomplete.',
            ]);
        }

        $pdf = Pdf::loadView('receipt', [
            'payslip' => $payslip,
            'employee' => $employee,
            'payrollRun' => $payrollRun,
        ])->setPaper([0, 0, 420, 700]);

        $fileName = sprintf(
            'payslip-%s-%s.pdf',
            $employee->employee_code,
            $payslip->payslip_number
        );

        return response()->streamDownload(
            function () use ($pdf) {
                echo $pdf->output();
            },
            $fileName,
            [
                'Content-Type' => 'application/pdf',
            ]
        );
    }
}