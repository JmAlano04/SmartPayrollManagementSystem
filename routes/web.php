<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardsController;
use App\Http\Controllers\EmployeesController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardsController::class, 'index'])->name('dashboard');
   

    // Employee ROUTE
    Route::get ('/employees', [EmployeesController::class, 'index'])->name('employees.index');
    Route::post ('/employees/store', [EmployeesController::class, 'store'])->name('employee.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';