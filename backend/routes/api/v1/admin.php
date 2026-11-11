<?php

use App\Enums\Permission;
use App\Http\Controllers\Api\V1\Admin\HolidayController;
use App\Http\Controllers\Api\V1\Admin\PageController;
use App\Http\Controllers\Api\V1\Admin\ServiceController;
use App\Http\Controllers\Api\V1\Admin\SettingsController;
use App\Services\Settings\SettingsSchema;
use Illuminate\Support\Facades\Route;

/*
| Admin panel endpoints (Step 7 §11): signed-in, active staff, plus a permission per area.
*/

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth:sanctum', 'active', 'staff'])
    ->group(function () {
        Route::middleware('permission:'.Permission::SettingsManage->value)->group(function () {
            Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
            Route::patch('/settings/{group}', [SettingsController::class, 'update'])
                ->whereIn('group', SettingsSchema::groups())
                ->name('settings.update');

            Route::get('/holidays', [HolidayController::class, 'index'])->name('holidays.index');
            Route::post('/holidays', [HolidayController::class, 'store'])->name('holidays.store');
            Route::delete('/holidays/{holiday}', [HolidayController::class, 'destroy'])->name('holidays.destroy');
        });

        Route::middleware('permission:'.Permission::ContentManage->value)->group(function () {
            Route::post('/services/reorder', [ServiceController::class, 'reorder'])->name('services.reorder');
            Route::apiResource('services', ServiceController::class);

            Route::get('/pages', [PageController::class, 'index'])->name('pages.index');
            Route::get('/pages/{page}', [PageController::class, 'show'])->name('pages.show');
            Route::patch('/pages/{page}', [PageController::class, 'update'])->name('pages.update');
        });
    });
