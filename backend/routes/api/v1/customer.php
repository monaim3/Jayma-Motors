<?php

use App\Http\Controllers\Api\V1\Customer\AppointmentController;
use Illuminate\Support\Facades\Route;

/*
| Customer portal endpoints (Step 7 §10): signed-in, active customers only.
| Built milestone by milestone from B3.
*/

Route::prefix('me')
    ->name('me.')
    ->middleware(['auth:sanctum', 'active', 'customer'])
    ->group(function () {
        Route::get('/appointments', [AppointmentController::class, 'index'])->name('appointments.index');
        Route::get('/appointments/{reference}', [AppointmentController::class, 'show'])->name('appointments.show');
        Route::post('/appointments/{reference}/cancel', [AppointmentController::class, 'cancel'])->name('appointments.cancel');
    });
