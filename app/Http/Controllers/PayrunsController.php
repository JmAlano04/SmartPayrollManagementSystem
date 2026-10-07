<?php

namespace App\Http\Controllers;

use App\Models\PayrollRun;
use App\Services\PayrollService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrunsController extends Controller
{
    public function __construct(
        protected PayrollService $payrollService
    ) {}

    public function index(Request $request)
    {
        $filters = [
            'search' => $request->string('search')->trim()->toString(),
            'status' => $request->string('status')->toString(),
            'pay_period' => $request->string('pay_period')->toString(),
        ];

        return Inertia::render('payruns', [
            'stats' => $this->payrollService->getStats(),
            'payRuns' => $this->payrollService->getPayRuns($filters),
            'filters' => $filters,
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'pay_date' => 'required|date',
            'status' => 'required|in:draft,paid',
        ]);

        PayrollRun::create([
            'period_start' => $validatedData['period_start'],
            'period_end' => $validatedData['period_end'],
            'pay_date' => $validatedData['pay_date'],
            'status' => $validatedData['status'],
        ]);

        return redirect()
            ->route('payruns.index')
            ->with('success', 'Payroll run created successfully.');
    }
    public function destroy(PayrollRun $payrun)
    {
        $payrun->delete();

        return redirect()
            ->route('payruns.index')
            ->with('success', 'Payroll run deleted successfully.');
    }


      public function downloadPayrun(PayrollRun $payrun)
    {
        // Implementation for downloading payrun
        $period = $payrun->period_start . ' to ' . $payrun->period_end;
        

        if (!$employee || !$payrollRun) {
            return back()->withErrors([
                'error' => 'Payroll run data is incomplete.',
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
