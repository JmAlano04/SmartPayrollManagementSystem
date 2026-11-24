<?php

namespace App\Http\Controllers;

use App\Support\FaceMatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Stores the face in employees.face_descriptor (JSON) and employees.face_enrolled_at.
 * The logged-in user is matched to their employee row through employees.user_id.
 */
class FaceRegistrationController extends Controller
{
    private function employeeFor(Request $request): ?object
    {
        return DB::table('employees')
            ->where('user_id', $request->user()->id)
            ->first(['id', 'face_descriptor', 'face_enrolled_at']);
    }

    public function show(Request $request): Response
    {
        $employee = $this->employeeFor($request);

        return Inertia::render('face-registration', [
            'registered' => (bool) ($employee && FaceMatcher::parse($employee->face_descriptor)),
            'registeredAt' => $employee?->face_enrolled_at
                ? Carbon::parse($employee->face_enrolled_at)->toIso8601String()
                : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $employee = $this->employeeFor($request);

        if (! $employee) {
            throw ValidationException::withMessages([
                'descriptors' => 'Your account is not linked to an employee record. Ask HR to link it.',
            ]);
        }

        $data = $request->validate([
            'descriptors' => ['required', 'array', 'size:5'],
            'descriptors.*' => ['required', 'array', 'size:128'],
            'descriptors.*.*' => ['required', 'numeric'],
        ], [
            'descriptors.size' => 'Please capture all 5 samples.',
            'descriptors.*.size' => 'A face sample was invalid. Please retake it.',
        ]);

        $descriptors = array_map(
            fn (array $d) => array_map('floatval', $d),
            $data['descriptors'],
        );

        // All 5 samples must be the same person
        for ($i = 0; $i < 5; $i++) {
            for ($j = $i + 1; $j < 5; $j++) {
                if (FaceMatcher::distance($descriptors[$i], $descriptors[$j]) > 0.65) {
                    throw ValidationException::withMessages([
                        'descriptors' => 'The samples do not look like the same person. Please start over.',
                    ]);
                }
            }
        }

        // Replaces the old face data when re-registering
        DB::table('employees')->where('id', $employee->id)->update([
            'face_descriptor' => json_encode($descriptors),
            'face_enrolled_at' => now(),
            'updated_at' => now(),
        ]);

        return back();
    }
}