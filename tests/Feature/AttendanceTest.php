<?php

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\User;

function createAttendanceEmployee(): Employee
{
    $user = User::factory()->create();

    return Employee::create([
        'user_id' => $user->id,
        'employee_code' => 'EMP-'.$user->id,
        'first_name' => 'Taylor',
        'last_name' => 'Employee',
        'email' => 'employee-'.$user->id.'@example.test',
        'department' => 'Finance',
        'position' => 'Accountant',
        'hire_date' => '2025-01-01',
        'employment_type' => 'full_time',
        'status' => 'active',
    ]);
}

test('authenticated users can see persisted attendance and employee options', function () {
    $this->actingAs(User::factory()->create());
    $employee = createAttendanceEmployee();

    Attendance::create([
        'employee_id' => $employee->id,
        'work_date' => '2026-10-12',
        'time_in' => '08:00',
        'time_out' => '17:00',
        'hours_worked' => 8,
        'overtime_hours' => 0,
        'status' => 'present',
    ]);

    $this->get('/attendance')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('attendance')
            ->where('records.0.employee_name', 'Taylor Employee')
            ->where('records.0.employee_code', $employee->employee_code)
            ->where('records.0.date', '2026-10-12')
            ->where('employees.0.id', $employee->id)
        );
});

test('attendance records can be created updated and deleted', function () {
    $this->actingAs(User::factory()->create());
    $employee = createAttendanceEmployee();

    $this->post('/attendance', [
        'employee_id' => $employee->id,
        'date' => '2026-10-12',
        'time_in' => '08:00',
        'time_out' => '18:00',
        'status' => 'late',
        'remarks' => 'Heavy traffic',
    ])->assertRedirect();

    $attendance = Attendance::firstOrFail();
    expect($attendance->hours_worked)->toBe(9.0)
        ->and($attendance->overtime_hours)->toBe(1.0);

    $this->from('/attendance')->post('/attendance', [
        'employee_id' => $employee->id,
        'date' => '2026-10-12',
        'time_in' => '08:00',
        'time_out' => '17:00',
        'status' => 'present',
    ])->assertSessionHasErrors('date');

    $this->put("/attendance/{$attendance->id}", [
        'employee_id' => $employee->id,
        'date' => '2026-10-12',
        'time_in' => null,
        'time_out' => null,
        'status' => 'absent',
        'remarks' => 'Sick leave',
    ])->assertRedirect();

    $this->assertDatabaseHas('attendance', [
        'id' => $attendance->id,
        'status' => 'absent',
        'is_absent' => true,
        'hours_worked' => 0,
    ]);

    $this->put("/attendance/{$attendance->id}", [
        'employee_id' => $employee->id,
        'date' => '2026-10-12',
        'time_in' => null,
        'time_out' => null,
        'status' => 'on_leave',
    ])->assertRedirect();

    $this->assertDatabaseHas('attendance', [
        'id' => $attendance->id,
        'status' => 'on_leave',
        'is_paid_leave' => true,
        'hours_worked' => 0,
    ]);

    $this->delete("/attendance/{$attendance->id}")->assertRedirect();

    $this->assertDatabaseMissing('attendance', ['id' => $attendance->id]);
});
