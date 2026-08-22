<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
use App\Services\EmployeeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
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