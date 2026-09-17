<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\PayrollService;

class PayrunsController extends Controller
{
    public function __construct(
        protected PayrollService $payrollService
    ) {}

    public function index(Request $request)
    {
        return Inertia::render('payruns', [
            'stats' => $this->payrollService->getStats(),
            'payRuns' => $this->payrollService->getPayRuns(),
        ]);
    }
}