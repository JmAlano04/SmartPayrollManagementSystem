<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Services\AttendanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttendancesController extends Controller
{
    public function __construct(private AttendanceService $service) {}

    public function index(Request $request): Response
    {
        $filters = $this->filters($request);

        return Inertia::render('attendance', [
            'records' => $this->service->getRecords($filters),
            'stats' => $this->service->getStats(),
            'totalHours' => $this->service->getTotalHours($filters),
            'employees' => $this->service->getEmployeeOptions(),
            'departments' => $this->service->getDepartments(),
            'filters' => $filters,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $rows = $this->service->getExportRows($this->filters($request));

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');

            fputcsv($out, ['Employee', 'ID', 'Department', 'Date', 'Time In', 'Time Out', 'Hours', 'Status', 'Remarks']);

            foreach ($rows as $row) {
                fputcsv($out, [
                    $row['employee_name'],
                    $row['employee_code'],
                    $row['department'],
                    $row['date'],
                    $row['time_in'] ?? '',
                    $row['time_out'] ?? '',
                    $row['hours_worked'],
                    ucwords(str_replace('_', ' ', $row['status'])),
                    $row['remarks'] ?? '',
                ]);
            }

            fclose($out);
        }, 'attendance.csv', ['Content-Type' => 'text/csv']);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->service->create($this->validateAttendance($request));

        return redirect()->back()->with('success', 'Attendance record created successfully.');
    }

    public function update(Request $request, Attendance $attendance): RedirectResponse
    {
        $this->service->update($attendance, $this->validateAttendance($request, $attendance));

        return redirect()->back()->with('success', 'Attendance record updated successfully.');
    }

    public function destroy(Attendance $attendance): RedirectResponse
    {
        Attendance::destroy($attendance->id);

        return redirect()->back()->with('success', 'Attendance record deleted successfully.');
    }

    private function filters(Request $request): array
    {
        return [
            'search' => trim((string) $request->query('search', '')),
            'status' => (string) $request->query('status', ''),
            'department' => (string) $request->query('department', ''),
            'date' => (string) $request->query('date', ''),
        ];
    }

    private function validateAttendance(Request $request, ?Attendance $attendance = null): array
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'integer', Rule::exists('employees', 'id')],
            'date' => ['required', 'date'],
            'time_in' => ['nullable', 'required_if:status,present,late', 'date_format:H:i'],
            'time_out' => ['nullable', 'required_if:status,present,late', 'date_format:H:i', 'after:time_in'],
            'status' => ['required', Rule::in(['present', 'late', 'absent', 'on_leave'])],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $duplicate = Attendance::query()
            ->where('employee_id', $validated['employee_id'])
            ->whereDate('work_date', '=', $validated['date']);

        if ($attendance) {
            $duplicate->where('id', '!=', $attendance->id);
        }

        if ($duplicate->exists()) {
            throw ValidationException::withMessages([
                'date' => 'This employee already has an attendance record for this date.',
            ]);
        }

        return $validated;
    }
}