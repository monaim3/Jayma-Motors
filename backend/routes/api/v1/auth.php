<?php

use App\Http\Controllers\Api\V1\Auth\EmailVerificationController;
use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\PasswordController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\SessionController;
use App\Http\Controllers\Api\V1\Auth\StaffLoginController;
use Illuminate\Support\Facades\Route;

/*
| Authentication (Step 7 §8, milestone B1). Cookie sessions via Sanctum:
| the frontend first calls GET /sanctum/csrf-cookie.
*/

Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('/register', RegisterController::class)->middleware('throttle:register')->name('register');
    Route::post('/login', LoginController::class)->middleware('throttle:login')->name('login');
    Route::post('/staff/login', StaffLoginController::class)->middleware('throttle:login')->name('staff.login');

    Route::post('/forgot-password', [PasswordController::class, 'forgot'])->middleware('throttle:password')->name('password.forgot');
    Route::post('/reset-password', [PasswordController::class, 'reset'])->middleware('throttle:password')->name('password.reset');

    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        Route::get('/me', [SessionController::class, 'me'])->name('me');
        Route::post('/logout', [SessionController::class, 'logout'])->name('logout');

        Route::post('/email/verification-notification', [EmailVerificationController::class, 'send'])
            ->middleware(['customer', 'throttle:6,1'])
            ->name('verification.send');
        // Relative signature: the frontend forwards ?expires=&signature= from the emailed link.
        Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
            ->middleware(['customer', 'signed:relative', 'throttle:6,1'])
            ->name('verification.verify');
    });
});
