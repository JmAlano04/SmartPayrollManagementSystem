<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class AttendanceService
{
    public const PER_PAGE = 10;

    /**
     * Paginated records (10 per page) with filters applied.
     */
    public function getRecords(array $filters = [], int $perPage = self::PER_PAGE): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->with('employee:id,employee_code,first_name,last_name,department')
            ->orderByDesc('work_date')
            ->orderBy('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Attendance $attendance) => $this->transform($attendance));
    }

    /**
     * Every record matching the filters (used for CSV export).
     */
    public function getExportRows(array $filters = []): Collection
    {
        return $this->filteredQuery($filters)
            ->with('employee:id,employee_code,first_name,last_name,department')
            ->orderByDesc('work_date')
            ->orderBy('id')
            ->get()
            ->map(fn (Attendance $attendance) => $this->transform($attendance));
    }

    /**
     * Status counts across all attendance records.
     */
    public function getStats(): array
    {
        $counts = Attendance::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'present' => (int) ($counts['present'] ?? 0),
            'late' => (int) ($counts['late'] ?? 0),
            'absent' => (int) ($counts['absent'] ?? 0),
            'on_leave' => (int) ($counts['on_leave'] ?? 0),
        ];
    }

    /**
     * Total hours across every record matching the filters (not just the current page).
     */
    public function getTotalHours(array $filters = []): float
    {
        return round((float) $this->filteredQuery($filters)->sum('hours_worked'), 2);
    }

    public function getEmployeeOptions(): Collection
    {
        return Employee::query()
            ->orderBy('first_name', 'asc')
            ->orderBy('last_name', 'asc')
            ->get(['id', 'employee_code', 'first_name', 'last_name', 'department'])
            ->map(fn (Employee $employee) => [
                'id' => $employee->id,
                'name' => trim($employee->first_name.' '.$employee->last_name),
                'code' => $employee->employee_code,
                'department' => $employee->department,
            ]);
    }

    public function getDepartments(): Collection
    {
        return Employee::query()
            ->whereNotNull('department', 'and')
            ->where('department', '!=', '')
            ->distinct()
            ->orderBy('department', 'asc')
            ->pluck('department');
    }

    public function create(array $data): Attendance
    {
        return Attendance::create($this->attributes($data));
    }

    public function update(Attendance $attendance, array $data): Attendance
    {
        $attendance->update($this->attributes($data));

        return $attendance;
    }

    private function filteredQuery(array $filters): Builder
    {
        return Attendance::query()
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['date'] ?? null, fn (Builder $query, string $date) => $query->whereDate('work_date', $date))
            ->when(
                $filters['department'] ?? null,
                fn (Builder $query, string $department) => $query->whereHas(
                    'employee',
                    fn (Builder $employee) => $employee->where('department', $department)
                )
            )
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                // Every word must match somewhere, so "john doe" matches first_name + last_name.
                foreach (preg_split('/\s+/', trim($search)) ?: [] as $term) {
                    $like = '%'.addcslashes($term, '%_\\').'%';

                    $query->where(function (Builder $where) use ($like) {
                        $where->where('remarks', 'like', $like)
                            ->orWhereHas('employee', function (Builder $employee) use ($like) {
                                $employee->where(function (Builder $match) use ($like) {
                                    $match->where('first_name', 'like', $like)
                                        ->orWhere('last_name', 'like', $like)
                                        ->orWhere('employee_code', 'like', $like)
                                        ->orWhere('department', 'like', $like);
                                });
                            });
                    });
                }
            });
    }

    private function transform(Attendance $attendance): array
    {
        return [
            'id' => $attendance->id,
            'employee_id' => $attendance->employee_id,
            'employee_name' => trim(($attendance->employee?->first_name ?? '').' '.($attendance->employee?->last_name ?? '')),
            'employee_code' => $attendance->employee?->employee_code ?? '',
            'department' => $attendance->employee?->department ?? '—',
            'date' => $attendance->work_date->format('Y-m-d'),
            'time_in' => $attendance->time_in ? substr($attendance->time_in, 0, 5) : null,
            'time_out' => $attendance->time_out ? substr($attendance->time_out, 0, 5) : null,
            'hours_worked' => (float) $attendance->hours_worked,
            'status' => $attendance->status,
            'remarks' => $attendance->remarks,
        ];
    }

    private function attributes(array $data): array
    {
        $hoursWorked = $this->calculateHoursWorked($data);
        $hasTime = in_array($data['status'], ['present', 'late'], true);

        return [
            'employee_id' => $data['employee_id'],
            'work_date' => $data['date'],
            'time_in' => $hasTime ? (($data['time_in'] ?? null) ?: null) : null,
            'time_out' => $hasTime ? (($data['time_out'] ?? null) ?: null) : null,
            'hours_worked' => $hoursWorked,
            'overtime_hours' => round(max($hoursWorked - 8, 0), 2),
            'status' => $data['status'],
            'remarks' => $data['remarks'] ?? null,
            'is_absent' => $data['status'] === 'absent',
            'is_paid_leave' => $data['status'] === 'on_leave',
        ];
    }

    private function calculateHoursWorked(array $data): float
    {
        if (! in_array($data['status'], ['present', 'late'], true) || empty($data['time_in']) || empty($data['time_out'])) {
            return 0;
        }

        $start = Carbon::createFromFormat('H:i', $data['time_in']);
        $end = Carbon::createFromFormat('H:i', $data['time_out']);
        $minutes = $start->diffInMinutes($end);

        if ($minutes > 300) {
            $minutes -= 60;
        }

        return round($minutes / 60, 2);
    }
}