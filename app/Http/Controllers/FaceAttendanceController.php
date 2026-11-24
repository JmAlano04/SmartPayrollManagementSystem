<?php

namespace App\Http\Controllers;

use App\Support\FaceMatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Face scan -> identifies the employee -> writes to your existing tables:
 *   attendance  (one row per employee per day: time_in, time_out, hours_worked, overtime_hours, status)
 *   clock_ins   (one row per scan: clocked_at, type in/out, match_confidence)
 */
class FaceAttendanceController extends Controller
{
    private const TZ = 'Asia/Manila';

    /** Time in after this local time is marked "late". */
    private const LATE_AFTER = '09:00:00';

    /** Hours per day before overtime starts. */
    private const REGULAR_HOURS = 8;

    /** Minimum seconds between time in and time out. */
    private const MIN_SECONDS_BETWEEN = 60;

    public function show(): Response
    {
        return Inertia::render('face-attendance', [
            'enrolled' => DB::table('employees')
                ->where('status', 'active')
                ->whereNotNull('face_descriptor')
                ->count(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'descriptor' => ['required', 'array', 'size:128'],
            'descriptor.*' => ['required', 'numeric'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $probe = array_map('floatval', $request->input('descriptor'));

        $employees = DB::table('employees')
            ->where('status', 'active')
            ->whereNotNull('face_descriptor')
            ->get(['id', 'first_name', 'last_name', 'face_descriptor']);

        $templates = [];

        foreach ($employees as $e) {
            $descriptors = FaceMatcher::parse($e->face_descriptor);

            if ($descriptors) {
                $templates[] = ['id' => $e->id, 'descriptors' => $descriptors];
            }
        }

        if (! $templates) {
            return response()->json(['message' => 'No faces are registered yet.'], 422);
        }

        $match = FaceMatcher::identify($probe, $templates);

        if (! $match) {
            return response()->json([
                'message' => 'Face not recognized. Try again, or re-register your face.',
            ], 422);
        }

        $employee = $employees->firstWhere('id', $match['id']);
        $name = trim($employee->first_name.' '.$employee->last_name);
        $local = now(self::TZ);
        $photo = $request->file('photo');

        $result = DB::transaction(function () use ($employee, $match, $local, $photo) {
            $workDate = $local->toDateString();

            // Make sure today's row exists (it may already, e.g. pre-created as absent)
            DB::table('attendance')->insertOrIgnore([
                'employee_id' => $employee->id,
                'work_date' => $workDate,
                'hours_worked' => 0,
                'overtime_hours' => 0,
                'status' => 'present',
                'is_absent' => 0,
                'is_paid_leave' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Lock the row so two quick scans cannot both punch
            $row = DB::table('attendance')
                ->where('employee_id', $employee->id)
                ->where('work_date', $workDate)
                ->lockForUpdate()
                ->first();

            $action = null;

            if (! $row->time_in) {
                $late = $local->format('H:i:s') > self::LATE_AFTER;

                DB::table('attendance')->where('id', $row->id)->update([
                    'time_in' => $local->format('H:i:s'),
                    'status' => $late ? 'late' : 'present',
                    'is_absent' => 0,
                    'updated_at' => now(),
                ]);

                $action = 'time_in';
                $status = $late ? 'late' : 'present';
            } elseif (! $row->time_out) {
                $in = Carbon::parse($workDate.' '.$row->time_in, self::TZ);
                $seconds = $local->timestamp - $in->timestamp;

                if ($seconds < self::MIN_SECONDS_BETWEEN) {
                    return ['action' => 'too_soon', 'status' => $row->status];
                }

                $hours = round($seconds / 3600, 2);

                DB::table('attendance')->where('id', $row->id)->update([
                    'time_out' => $local->format('H:i:s'),
                    'hours_worked' => $hours,
                    'overtime_hours' => max(0, round($hours - self::REGULAR_HOURS, 2)),
                    'updated_at' => now(),
                ]);

                $action = 'time_out';
                $status = $row->status;
            } else {
                return ['action' => 'already_done', 'status' => $row->status];
            }

            // Log the scan itself
            $clock = [
                'employee_id' => $employee->id,
                'clocked_at' => now(),
                'type' => $action === 'time_in' ? 'in' : 'out',
                'match_confidence' => max(0, round(1 - $match['distance'], 4)),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if ($photo && Schema::hasColumn('clock_ins', 'photo')) {
                $clock['photo'] = $photo->store('attendance/'.$local->toDateString());
            }

            DB::table('clock_ins')->insert($clock);

            return ['action' => $action, 'status' => $status];
        });

        return response()->json($result + [
            'name' => $name,
            'time' => $local->format('h:i A'),
        ]);
    }
}