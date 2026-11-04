<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1
|--------------------------------------------------------------------------
|
| Routes are split by area (Step 7 §2). Each file is added as its milestone
| is built: auth (B1), public (B2+), customer (B3+), admin (B2+).
|
*/

Route::prefix('v1')->middleware('throttle:api')->group(function () {
    Route::get('/health', fn () => response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'time' => now()->toIso8601String(),
    ]))->name('health');

    foreach (['auth', 'public', 'customer', 'admin'] as $area) {
        $file = __DIR__."/api/v1/{$area}.php";

        if (is_file($file)) {
            require $file;
        }
    }
});
