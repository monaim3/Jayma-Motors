<?php

use App\Http\Controllers\Api\V1\Customer\AppointmentController;
use App\Http\Controllers\Api\V1\Customer\ProfileController;
use App\Http\Controllers\Api\V1\Customer\VehicleController;
use Illuminate\Support\Facades\Route;

/*
| Customer portal endpoints (Step 7 §10): signed-in, active customers only.
| Built milestone by milestone from B3.
*/

Route::prefix('me')
    ->name('me.')
    ->middleware(['auth:sanctum', 'active', 'customer'])
    ->group(function () {
        Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('/password', [ProfileController::class, 'password'])->middleware('throttle:password')->name('password.update');

        Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
        Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
        Route::patch('/vehicles/{id}', [VehicleController::class, 'update'])->whereNumber('id')->name('vehicles.update');
        Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy'])->whereNumber('id')->name('vehicles.destroy');

        Route::get('/appointments', [AppointmentController::class, 'index'])->name('appointments.index');
        Route::get('/appointments/{reference}', [AppointmentController::class, 'show'])->name('appointments.show');
        Route::post('/appointments/{reference}/cancel', [AppointmentController::class, 'cancel'])->name('appointments.cancel');
    });
