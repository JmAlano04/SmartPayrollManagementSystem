<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardsController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardsController::class, 'index'])->name('dashboard');
    Route::get('/employee', function () {
        return Inertia::render('employee');
    })->name('employee');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';