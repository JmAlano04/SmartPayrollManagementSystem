<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Inertia\Inertia;

class EmployeesController extends Controller
{
    public function index()

    {
        // Card Data
        $totalEmployees      = Employee::count('id');
        $activeEmployees     = Employee::where('status', '=', 'active')->count('id');
        $terminatedEmployees = Employee::where('status', '=', 'terminated')->count('id');
        $onLeaveCount        = Employee::where('status', '=', 'on_leave')->count('id');


        // Fetch employees with their latest salary structure table and map the data to include the salary information
        $employees = Employee::with('salaryStructures')->take(10)->get()->map(function ($employee) {
            $salaryStructure = $employee->salaryStructures->last();
            return [
                'id' => $employee->id,
                'name' => trim($employee->first_name . ' ' . $employee->last_name),
                'email' => $employee->email,
                'department' => $employee->department,
                'position' => $employee->position,
                'salary' => (float) ($salaryStructure->base_salary ?? 0),
                'status' => $employee->status,
                'hire_date' => $employee->hire_date,
            ];
        });

        return Inertia::render('employee', [
              'stats' => [
                    'totalEmployees'      => $totalEmployees,
                    'activeEmployees'     => $activeEmployees,
                    'terminatedEmployees' => $terminatedEmployees,
                    'onLeaveCount'        => $onLeaveCount,
                ],
            
            'employees' => $employees,
        ]);
    }
}
