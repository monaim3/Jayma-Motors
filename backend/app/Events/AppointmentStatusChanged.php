<?php

namespace App\Events;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * An appointment was confirmed, rescheduled or cancelled (Step 7 §4).
 * $byCustomer: the customer did it (a cancellation then alerts the workshop).
 */
class AppointmentStatusChanged
{
    use Dispatchable;

    public function __construct(
        public readonly Appointment $appointment,
        public readonly string $action,
        public readonly ?AppointmentStatus $from = null,
        public readonly bool $byCustomer = false,
    ) {}
}
