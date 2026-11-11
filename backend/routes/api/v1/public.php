<?php

use App\Http\Controllers\Api\V1\Public\PageController;
use App\Http\Controllers\Api\V1\Public\RedirectController;
use App\Http\Controllers\Api\V1\Public\ServiceController;
use App\Http\Controllers\Api\V1\Public\SettingsController;
use Illuminate\Support\Facades\Route;

/*
| Public website endpoints (Step 7 §9). Built milestone by milestone from B2.
*/

Route::get('/settings/public', SettingsController::class)->name('settings.public');

Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{slug}', [ServiceController::class, 'show'])->name('services.show');

Route::get('/pages/{key}', PageController::class)->name('pages.show');

Route::get('/redirects', RedirectController::class)->name('redirects.show');
