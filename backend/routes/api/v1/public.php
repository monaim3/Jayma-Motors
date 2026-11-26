<?php

use App\Http\Controllers\Api\V1\Public\AppointmentController;
use App\Http\Controllers\Api\V1\Public\PageController;
use App\Http\Controllers\Api\V1\Public\RedirectController;
use App\Http\Controllers\Api\V1\Public\ServiceController;
use App\Http\Controllers\Api\V1\Public\SettingsController;
use App\Http\Controllers\Api\V1\Public\VehicleBrandController;
use Illuminate\Support\Facades\Route;

/*
| Public website endpoints (Step 7 §9). Built milestone by milestone from B2.
*/

Route::get('/settings/public', SettingsController::class)->name('settings.public');

Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{slug}', [ServiceController::class, 'show'])->name('services.show');

Route::get('/pages/{key}', PageController::class)->name('pages.show');

Route::get('/redirects', RedirectController::class)->name('redirects.show');

Route::get('/vehicle-brands', VehicleBrandController::class)->name('vehicle-brands.index');

// B3 — booking (Step 7 §9). Booking needs a signed-in, active customer
// (owner, 2026-11-26); guests are sent to log in by the website first.
Route::get('/appointments/availability', [AppointmentController::class, 'availability'])->name('appointments.availability');
Route::post('/appointments', [AppointmentController::class, 'store'])
    ->middleware(['auth:sanctum', 'active', 'customer', 'throttle:public-forms'])
    ->name('appointments.store');
