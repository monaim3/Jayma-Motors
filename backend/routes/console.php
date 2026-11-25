<?php

use App\Services\Appointments\AppointmentService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Step 7 §6: pending bookings whose date has passed become "expired".
Artisan::command('appointments:expire-pending', function (AppointmentService $appointments) {
    $this->info($appointments->expirePast().' pending booking(s) expired.');
})->purpose('Mark past, never-confirmed bookings as expired');

Schedule::command('appointments:expire-pending')
    ->dailyAt('00:30')
    ->timezone(config('app.business_timezone'))
    ->withoutOverlapping();
