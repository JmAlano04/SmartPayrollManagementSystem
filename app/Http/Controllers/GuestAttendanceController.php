<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GuestAttendanceController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('GuestCamera');
    }

    public function punch(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'employee_code' => ['required', 'string', 'max:50'],
            'photo' => ['required', 'image', 'max:4096'],
        ]);

        $employee = Employee::query()
            ->where('employee_code', '=', strtoupper(trim($data['employee_code'])))
            ->first();

        // Same message for "not found" so codes can't be guessed one by one.
        if (! $employee) {
            throw ValidationException::withMessages([
                'punch' => 'Employee code not found.',
            ]);
        }

        $now = now();
        $path = $request->file('photo')->store('attendance-photos', 'public');

        $attendance = Attendance::firstOrNew([
            'employee_id' => $employee->id,
            'work_date' => $now->toDateString(),
        ]);

        if (! $attendance->exists) {
            // Clock in
            $attendance->time_in = $now->format('H:i:s');
            $attendance->status = 'present';
            $attendance->hours_worked = 0;
            $attendance->overtime_hours = 0;
            $this->savePhoto($attendance, 'time_in_photo', $path);
            $attendance->save();

            return back()->with('status', "Clocked in at {$now->format('g:i A')}.");
        }

        if ($attendance->time_out === null) {
            // Clock out
            $timeIn = $now->copy()->setTimeFromTimeString($attendance->time_in);
            $worked = round($timeIn->diffInMinutes($now) / 60, 2);

            $attendance->time_out = $now->format('H:i:s');
            $attendance->hours_worked = $worked;
            $this->savePhoto($attendance, 'time_out_photo', $path);
            $attendance->save();

            return back()->with('status', "Clocked out at {$now->format('g:i A')}.");
        }

        throw ValidationException::withMessages([
            'punch' => 'You have already clocked out today.',
        ]);
    }

    /** Only store the photo path if the column exists. */
    private function savePhoto(Attendance $attendance, string $column, string $path): void
    {
        if (Schema::hasColumn($attendance->getTable(), $column)) {
            $attendance->{$column} = $path;
        }
    }
}