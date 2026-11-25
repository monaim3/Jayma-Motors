<?php

namespace App\Enums;

/** Where a booking came from (Step 4 §7.1). */
enum AppointmentSource: string
{
    case Website = 'website';
    case Staff = 'staff';
}
