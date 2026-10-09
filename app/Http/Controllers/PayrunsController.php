<?php

namespace App\Http\Controllers;

use App\Models\PayrollRun;
use App\Services\PayrollService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
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

        PayrollRun::create($validatedData);

        return redirect()
            ->route('payruns.index')
            ->with('success', 'Payroll run created successfully.');
    }
    public function update(Request $request, PayrollRun $payrun)
    {
        $validatedData = $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'pay_date' => 'required|date',
            'status' => 'required|in:draft,paid',
        ]);

        $payrun->update($validatedData);

        return redirect()
            ->route('payruns.index')
            ->with('success', 'Payroll run updated successfully.');
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
        // Eager load to avoid N+1 queries
        $payrun->load('payslips.employee');

        if ($payrun->payslips->isEmpty()) {
            return back()->withErrors([
                'error' => 'This payroll run has no payslips to export.',
            ]);
        }

        $start = Carbon::parse($payrun->period_start);
        $end = Carbon::parse($payrun->period_end);

        $pdf = Pdf::loadView('payrun_summary', [
            'payrollRun' => $payrun,
            'payslips' => $payrun->payslips,
            'period' => $start->format('M d, Y') . ' - ' . $end->format('M d, Y'),
        ])->setPaper('a4', 'landscape');

        $fileName = sprintf(
            'payrun-%s-to-%s.pdf',
            $start->format('Ymd'),
            $end->format('Ymd')
        );

        return response()->streamDownload(
            fn () => print($pdf->output()),
            $fileName,
            ['Content-Type' => 'application/pdf']
        );
    }
}