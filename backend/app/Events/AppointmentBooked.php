<?php

namespace App\Events;

use App\Models\Appointment;
use Illuminate\Foundation\Events\Dispatchable;

/** A new booking was made (Step 7 §4): email the customer and alert the workshop. */
class AppointmentBooked
{
    use Dispatchable;

    public function __construct(public readonly Appointment $appointment) {}
}
