<?php

namespace App\Services;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeService
{
    public function getEmployees(Request $request)
    {
        $query = Employee::with('salaryStructures');

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($query) use ($search) {
                $query->where('first_name', 'ILIKE', "%{$search}%")
                    ->orWhere('last_name', 'ILIKE', "%{$search}%")
                    ->orWhere('email', 'ILIKE', "%{$search}%")
                    ->orWhere('department', 'ILIKE', "%{$search}%")
                    ->orWhere('status', 'ILIKE', "%{$search}%");
            });
        }

        if ($request->filled('department')) {
            $query->where(
                'department',
                $request->input('department')
            );
        }

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->input('status')
            );
        }

        $employees = $query
            ->latest('created_at')
            ->paginate(10)
            ->withQueryString();

        $employees->through(function ($employee) {
            $salaryStructure = $employee->salaryStructures->last();

            return [
                'id' => $employee->id,
                'name' => trim(
                    $employee->first_name . ' ' . $employee->last_name
                ),
                'email' => $employee->email,
                'department' => $employee->department,
                'position' => $employee->position,
                'salary' => (float) ($salaryStructure->base_salary ?? 0),
                'status' => $employee->status,
                'hire_date' => $employee->hire_date,
                'employment_type' => $employee->employment_type,

            ];
        });

        return $employees;
    }

    public function getDepartments()
    {
        return Employee::query()
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->orderBy('department')
            ->pluck('department');
    }

    public function getStatuses()
    {
        return Employee::query()
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->distinct()
            ->orderBy('status')
            ->pluck('status');
    }

    public function getEmploymentTypes()
    {
        return Employee::query()
            ->whereNotNull('employment_type')
            ->where('employment_type', '!=', '')
            ->distinct()
            ->orderBy('employment_type')
            ->pluck('employment_type');
    }
  
    public function getStats()
    {
        return [
            'totalEmployees' => Employee::count(),

            'activeEmployees' => Employee::where(
                'status',
                'active'
            )->count(),

            'terminatedEmployees' => Employee::where(
                'status',
                'terminated'
            )->count(),

            'onLeaveCount' => Employee::where(
                'status',
                'on_leave'
            )->count(),
        ];
    }
}