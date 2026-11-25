<?php

namespace App\Mail;

use App\Models\Appointment;
use App\Services\Support\PhoneNumber;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Alert to the workshop's notification emails (Settings → notifications):
 * new booking | cancelled by the customer.
 */
class WorkshopAppointmentAlert extends Mailable
{
    public function __construct(
        public readonly Appointment $appointment,
        public readonly string $kind,
    ) {}

    public function envelope(): Envelope
    {
        $title = $this->kind === 'cancelled' ? 'Booking cancelled by customer' : 'New booking';

        return new Envelope(
            subject: "{$title}: {$this->appointment->reference} — {$this->appointment->preferred_date->format('j M')}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.appointments.workshop',
            with: [
                'appointment' => $this->appointment->loadMissing('service'),
                'kind' => $this->kind,
                'phone' => PhoneNumber::display($this->appointment->contact_phone),
                'adminUrl' => rtrim((string) config('app.frontend_url'), '/').'/admin',
            ],
        );
    }
}
