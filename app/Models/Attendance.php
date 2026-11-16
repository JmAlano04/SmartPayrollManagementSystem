<?php

namespace App\Services;

use App\Models\Attendances;
use App\Models\Employee;
use Illuminate\Support\Collection;

class AttendanceService
{
    /**
     * Records in the shape the attendance page expects.
     */
    public function getRecords(): Collection
    {
        return Attendances::with('employee:id,name,department')
            ->orderByDesc('work_date')
            ->orderBy('id')
            ->get()
            ->map(fn (Attendances $attendance) => [
                'id'             => $attendance->id,
                'employee_id'    => $attendance->employee_id,
                'employee_name'  => $attendance->employee?->name ?? 'Unknown employee',
                'employee_code'  => $this->employeeCode($attendance->employee_id),
                'department'     => $attendance->employee?->department ?? '—',
                'work_date'      => $attendance->work_date->format('Y-m-d'),
                'hours_worked'   => (float) $attendance->hours_worked,
                'overtime_hours' => (float) $attendance->overtime_hours,
                'status'         => $attendance->status,
            ]);
    }

    /**
     * Counts per status. Always returns every key, even when zero.
     */
    public function getStats(): array
    {
        $row = Attendances::selectRaw(
            'SUM(CASE WHEN is_paid_leave = 1 THEN 1 ELSE 0 END) AS on_leave,
             SUM(CASE WHEN is_paid_leave = 0 AND is_absent = 1 THEN 1 ELSE 0 END) AS absent,
             SUM(CASE WHEN is_paid_leave = 0 AND is_absent = 0 THEN 1 ELSE 0 END) AS present,
             COALESCE(SUM(overtime_hours), 0) AS overtime'
        )->first();

        return [
            'present'  => (int) ($row->present ?? 0),
            'absent'   => (int) ($row->absent ?? 0),
            'on_leave' => (int) ($row->on_leave ?? 0),
            'overtime' => (float) ($row->overtime ?? 0),
        ];
    }

    /**

}