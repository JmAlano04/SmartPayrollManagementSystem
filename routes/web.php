<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\DashboardsController;
use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\PayrunsController as Payruns;
use App\Http\Controllers\AttendancesController;
use App\Http\Controllers\PayslipController;
use App\Http\Controllers\CostForecastController;
use App\Http\Controllers\FaceRecognitionController;
use App\Http\Controllers\GuestAttendanceController;
use App\Http\Controllers\EmployeePayslipController;


use App\Http\Controllers\FaceAttendanceController;
use App\Http\Controllers\FaceRegistrationController;

use Barryvdh\DomPDF\Facade\Pdf;

// HOME
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// PDF TEST
Route::get('/test-pdf', function () {
    $pdf = Pdf::loadHTML('
        <h1>PDF Test</h1>
        <p>DomPDF is working!</p>
    ');

    return $pdf->download('test.pdf');
});


   Route::get('/clock-in', [GuestAttendanceController::class, 'show'])
    ->name('clock-in');

Route::post('/clock-in', [GuestAttendanceController::class, 'punch'])
    ->middleware('throttle:10,1')
    ->name('clock-in.punch');

// AUTHENTICATED ROUTES
Route::middleware(['auth'])->group(function () {

    // DASHBOARD
    Route::get('/dashboard', [DashboardsController::class, 'index'])
        ->name('dashboard');

    // EMPLOYEES
    Route::get('/employees', [EmployeesController::class, 'index'])
        ->name('employeeDashboard.index');

    Route::post('/employees/store', [EmployeesController::class, 'store'])
        ->name('employee.store');

    Route::put('/employees/{employee}', [EmployeesController::class, 'update'])
        ->name('employee.update');

    Route::delete('/employees/destroy/{employee}', [EmployeesController::class, 'destroy'])
        ->name('employee.destroy');


    // PAYSLIPS
    Route::get('/payroll/payslips', [PayslipController::class, 'index'])
        ->name('payslips.index');

    Route::get('/payroll/payslips-employee' , [EmployeePayslipController::class,'index'])
        ->name('payroll.payslips-employee.index');

    Route::get('/payroll/payslips-employee/download/{payslip}', [EmployeePayslipController::class, 'download'])
        ->name('employee.payslips.download');

    Route::post('/payroll/payslips/generate-payslips', [PayslipController::class, 'store'])
        ->name('payslips.store');

    Route::get('/payslips/export', [PayslipController::class, 'export'])
        ->name('payslips.export');

    Route::post('/payslips/import', [PayslipController::class, 'import'])
        ->name('payslips.import');

    Route::put('/payslips/update/{payslip}', [PayslipController::class, 'update'])
        ->name('payslips.update');

    Route::get('/payslips/download/{payslip}', [PayslipController::class, 'downloadPayslip'])
        ->name('payslips.download');

    Route::get('/payslips/download-all', [PayslipController::class, 'downloadAll'])
        ->name('payslips.downloadAll');


    // PAYROLL RUNS
    Route::get('/payroll/runs', [Payruns::class, 'index'])
        ->name('payruns.index');

    Route::post('/payroll-runs/store', [Payruns::class, 'store'])
        ->name('payruns.store');

    Route::put('/payroll/runs/update/{payrun}', [Payruns::class, 'update'])
        ->name('payruns.update');

    Route::delete('/payroll/runs/destroy/{payrun}', [Payruns::class, 'destroy'])
        ->name('payruns.destroy');

    Route::get('/payroll/runs/download/{payrun}', [Payruns::class, 'downloadPayrun'])
        ->name('payruns.download');


    // ATTENDANCE
    Route::get('/attendance', [AttendancesController::class, 'index'])
        ->name('attendance');

    Route::post('/attendance', [AttendancesController::class, 'store'])
        ->name('attendance.store');

    Route::put('/attendance/{attendance}', [AttendancesController::class, 'update'])
        ->name('attendance.update');

    Route::delete('/attendance/{attendance}', [AttendancesController::class, 'destroy'])
        ->name('attendance.destroy');


 

      

    Route::middleware(['auth', 'verified'])->get('/face-recognition', [FaceRecognitionController::class, 'show'])->name('camera');

   


});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
