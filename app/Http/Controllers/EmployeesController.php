<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeesController extends Controller
{
    public function index(Request $request)
    {
        // Employee stats
        $totalEmployees = Employee::count();

        $activeEmployees = Employee::where(
            'status',
            '=',
            'active'
        )->count();

        $terminatedEmployees = Employee::where(
            'status',
            '=',
            'terminated'
        )->count();

        $onLeaveCount = Employee::where(
            'status',
            '=',
            'on_leave'
        )->count();

        // Departments
        $departments = Employee::query()
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->orderBy('department')
            ->pluck('department');

        // Statuses
        $statuses = Employee::query()
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->distinct()
            ->orderBy('status')
            ->pluck('status');

        // Employee query
        $query = Employee::with('salaryStructures');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($query) use ($search) {
                $query->where('first_name', 'ILIKE', "%{$search}%")
                    ->orWhere('last_name', 'ILIKE', "%{$search}%")
                    ->orWhere('email', 'ILIKE', "%{$search}%")
                    ->orWhere('department', 'ILIKE', "%{$search}%");
            });
        }

        // Department filter
        if ($request->filled('department')) {
            $query->where(
                'department',
                '=',
                $request->input('department')
            );
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where(
                'status',
                '=',
                $request->input('status')
            );
        }

        // Get employees
        $employees = $query
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(function ($employee) {
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
                ];
            });

        return Inertia::render('employee', [
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'activeEmployees' => $activeEmployees,
                'terminatedEmployees' => $terminatedEmployees,
                'onLeaveCount' => $onLeaveCount,
            ],

            'employees' => $employees,

            'departments' => $departments,

            'statuses' => $statuses,

            'selectedDepartment' => $request->input('department', ''),

            'selectedStatus' => $request->input('status', ''),

            'search' => $request->input('search', ''),
        ]);
    }
}