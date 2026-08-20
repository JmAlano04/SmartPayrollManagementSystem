<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class EmployeesController extends Controller
{
    public function index(Request $request)
    {
        // Stats
        $totalEmployees = Employee::count();

        $activeEmployees = Employee::where(
            'status',
            'active'
        )->count();

        $terminatedEmployees = Employee::where(
            'status',
            'terminated'
        )->count();

        $onLeaveCount = Employee::where(
            'status',
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

        // Search
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

        // Department filter
        if ($request->filled('department')) {
            $query->where(
                'department',
                $request->input('department')
            );
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->input('status')
            );
        }

        // Get employees
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

    public function store(Request $request): RedirectResponse
    {
        // Validate
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:' . User::class,
            ],
            'password' => [
                'required',
                'confirmed',
                Password::defaults(),
            ],
        ]);

        // Create user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Split name
        $nameParts = preg_split(
            '/\s+/',
            trim($user->name),
            2
        );

        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';

        // Employee code
        $code = 'EMP-' . str_pad(
            $user->id,
            4,
            '0',
            STR_PAD_LEFT
        );

        // Create employee
        Employee::create([
            'user_id' => $user->id,
            'employee_code' => $code,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $user->email,
            'department' => 'Unassigned',
            'position' => 'Employee',
            'hire_date' => now(),
            'employment_type' => 'full_time',
            'status' => 'active',
        ]);

        // Assign role
        $user->assignRole('employee');

        return redirect()
            ->route('employees.index')
            ->with('success', 'Employee added successfully.');
    }
}