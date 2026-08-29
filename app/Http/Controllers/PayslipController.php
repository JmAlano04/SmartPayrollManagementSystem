<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\PayslipsService;
use App\Service\Employee;

class PayslipController extends Controller
{
    public function __construct(
        protected PayslipsService $payslipsService
    ) {}

    public function index(Request $request)
    {

        return Inertia::render('payslips', [
            'stats' =>
                $this->payslipsService->getStats(),

            'payslips' =>
                $this->payslipsService->getPayslips($request),

            'filters' => [
                'search' => $request->search,
            ]
        ]);
    }
}