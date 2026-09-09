<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardsController;
use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\PayrunsController;
use App\Http\Controllers\PayslipController;
use Barryvdh\DomPDF\Facade\Pdf;
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::get('/test-pdf', function () {
    $pdf = Pdf::loadHTML('
        <h1>PDF Test</h1>
        <p>DomPDF is working!</p>
    ');

    return $pdf->download('test.pdf');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardsController::class, 'index'])->name('dashboard');
   

    // Employee ROUTE
    Route::get ('/employees', [EmployeesController::class, 'index'])->name('employees.index');
    Route::post ('/employees/store', [EmployeesController::class, 'store'])->name('employee.store');
    Route::put ('/employees/{employee}', [EmployeesController::class, 'update'])->name('employee.update');
    Route::Delete ('/employees/destroy/{employee}', [EmployeesController::class, 'destroy'])-> name('employee.destroy');


      //  Payslips ROUTE
    Route::get('/payroll/payslips', [PayslipController::class, 'index'])->name('payslips.index');
    Route::post('/payroll/payslips/generate-payslips', [PayslipController::class, 'store'])->name('payslips.store');
    Route::get('/payslips/export', [PayslipController::class, 'export'])
    ->name('payslips.export');
    Route::post('/payslips/import', [PayslipController::class, 'import'])
    ->name('payslips.import');


    //  Payroll Runs ROUTE
    // Route::get('/payroll/runs', [PayrunsController::class, 'index'])->name('payruns.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';