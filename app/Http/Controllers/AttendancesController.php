<?php

namespace App\Http\Controllers;

use App\Models\Attendances;
use App\Services\AttendanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttendancesController extends Controller
{
    public function __construct(private AttendanceService $service)
    {
    }

    public function index(): Response
    {
        return Inertia::render('attendance', [
            'records'     => $this->service->getRecords(),
            'stats'       => $this->service->getStats(),
            'employees'   => $this->service->getEmployeeOptions(),
            'departments' => $this->service->getDepartments(),
        ]);
    }
}