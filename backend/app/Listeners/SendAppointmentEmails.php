<?php

namespace App\Listeners;

use App\Events\AppointmentBooked;
use App\Events\AppointmentStatusChanged;
use App\Jobs\SendAppointmentEmail;
use App\Mail\CustomerAppointmentMail;
use App\Mail\WorkshopAppointmentAlert;
use App\Models\Appointment;
use App\Services\Settings\SettingsService;

/**
 * Appointment emails (Step 7 §4). All sent after the response. Both
 * handle* methods are found by Laravel's event discovery.
 * - Booked: customer (when they gave an email) + workshop alert.
 * - Confirmed / rescheduled / cancelled: customer.
 * - Cancelled by the customer: also a workshop alert.
 */
class SendAppointmentEmails
{
    public function __construct(private readonly SettingsService $settings) {}

    public function handleBooked(AppointmentBooked $event): void
    {
        $this->toCustomer($event->appointment, 'booked');
        $this->toWorkshop($event->appointment, 'new');
    }

    public function handleStatusChanged(AppointmentStatusChanged $event): void
    {
        if (in_array($event->action, ['confirmed', 'rescheduled', 'cancelled'], true)) {
            $this->toCustomer($event->appointment, $event->action);
        }

        if ($event->action === 'cancelled' && $event->byCustomer) {
            $this->toWorkshop($event->appointment, 'cancelled');
        }
    }

    private function toCustomer(Appointment $appointment, string $kind): void
    {
        if ($appointment->contact_email) {
            SendAppointmentEmail::dispatchAfterResponse(
                $appointment->contact_email,
                new CustomerAppointmentMail($appointment, $kind),
            );
        }
    }

    private function toWorkshop(Appointment $appointment, string $kind): void
    {
        $recipients = array_values(array_filter((array) $this->settings->get('notifications.recipient_emails', [])));

        if ($recipients !== []) {
            SendAppointmentEmail::dispatchAfterResponse($recipients, new WorkshopAppointmentAlert($appointment, $kind));
        }
    }
}
