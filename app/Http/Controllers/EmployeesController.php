<?php

namespace App\Http\Controllers;

use App\Services\EmployeeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeesController extends Controller
{
    public function __construct(
        protected EmployeeService $employeeService
    ) {}

    public function index(Request $request)
    {
        return Inertia::render('employee', [
            'stats' => $this->employeeService->getStats(),

            'employees' => $this->employeeService->getEmployees($request),

            'departments' => $this->employeeService->getDepartments(),

            'statuses' => $this->employeeService->getStatuses(),

            'selectedDepartment' => $request->input(
                'department',
                ''
            ),

            'selectedStatus' => $request->input(
                'status',
                ''
            ),

            'search' => $request->input(
                'search',
                ''
            ),
        ]);
    }
}