<?php

namespace App\Jobs;

use Illuminate\Contracts\Mail\Mailable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Sends one appointment email. Dispatched after the response (no queue
 * worker needed on shared hosting), so a slow or failing mail server never
 * delays or breaks a booking; failures are logged.
 */
class SendAppointmentEmail
{
    use Dispatchable;

    /**
     * @param  list<string>|string  $to
     */
    public function __construct(
        private readonly array|string $to,
        private readonly Mailable $mail,
    ) {}

    public function handle(): void
    {
        try {
            Mail::to($this->to)->send($this->mail);
        } catch (Throwable $e) {
            Log::warning('Appointment email could not be sent.', [
                'mail' => $this->mail::class,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
