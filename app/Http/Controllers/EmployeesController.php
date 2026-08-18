<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeesController extends Controller
{
    public function index(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | Employee Stats
        |--------------------------------------------------------------------------
        */

        $totalEmployees = Employee::count();

        $activeEmployees = Employee::where('status', 'active')
            ->count();

        $terminatedEmployees = Employee::where('status', 'terminated')
            ->count();

        $onLeaveCount = Employee::where('status', 'on_leave')
            ->count();


        /*
        |--------------------------------------------------------------------------
        | Departments for Select
        |--------------------------------------------------------------------------
        */

        $departments = Employee::query()
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->orderBy('department')
            ->pluck('department');


        /*
        |--------------------------------------------------------------------------
        | Statuses for Select
        |--------------------------------------------------------------------------
        */

        $statuses = Employee::query()
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->distinct()
            ->orderBy('status')
            ->pluck('status');


        /*
        |--------------------------------------------------------------------------
        | Employee Query
        |--------------------------------------------------------------------------
        */

        $query = Employee::with('salaryStructures');


        /*
        |--------------------------------------------------------------------------
        | Department Filter
        |--------------------------------------------------------------------------
        */

        if ($request->filled('department')) {
            $query->where(
                'department',
                $request->department
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Status Filter
        |--------------------------------------------------------------------------
        */

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->status
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Get Employees
        |--------------------------------------------------------------------------
        */

        $employees = $query
            ->take(10)
            ->get()
            ->map(function ($employee) {

                $salaryStructure =
                    $employee->salaryStructures->last();

                return [
                    'id' => $employee->id,

                    'name' => trim(
                        $employee->first_name .
                        ' ' .
                        $employee->last_name
                    ),

                    'email' => $employee->email,

                    'department' => $employee->department,

                    'position' => $employee->position,

                    'salary' => (float) (
                        $salaryStructure->base_salary ?? 0
                    ),

                    'status' => $employee->status,

                    'hire_date' => $employee->hire_date,
                ];
            });


        /*
        |--------------------------------------------------------------------------
        | Send Data to React
        |--------------------------------------------------------------------------
        */

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

            'selectedDepartment' =>
                $request->department,

            'selectedStatus' =>
                $request->status,
        ]);
    }
}