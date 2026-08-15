<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Inertia\Inertia;

class EmployeesController extends Controller
{
    public function index()
    {
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
            'employees' => $employees,
        ]);
    }
}
