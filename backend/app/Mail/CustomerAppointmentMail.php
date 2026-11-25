<?php

namespace App\Mail;

use App\Models\Appointment;
use App\Services\Settings\SettingsService;
use App\Services\Support\PhoneNumber;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Email to the customer about their booking (Step 7 §4):
 * booked | confirmed | rescheduled | cancelled.
 */
class CustomerAppointmentMail extends Mailable
{
    private const SUBJECTS = [
        'booked' => 'We received your booking',
        'confirmed' => 'Your appointment is confirmed',
        'rescheduled' => 'Your appointment date has changed',
        'cancelled' => 'Your appointment was cancelled',
    ];

    public function __construct(
        public readonly Appointment $appointment,
        public readonly string $kind,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: (self::SUBJECTS[$this->kind] ?? 'Your appointment').' — '.$this->appointment->reference,
        );
    }

    public function content(): Content
    {
        $phone = app(SettingsService::class)->get('business.phones.0.number');

        return new Content(
            markdown: 'mail.appointments.customer',
            with: [
                'appointment' => $this->appointment->loadMissing('service'),
                'kind' => $this->kind,
                'phone' => $phone ? PhoneNumber::display($phone) : null,
                'accountUrl' => rtrim((string) config('app.frontend_url'), '/').'/account/appointments',
            ],
        );
    }
}
