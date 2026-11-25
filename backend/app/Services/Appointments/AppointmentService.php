<?php

namespace App\Services\Appointments;

use App\Enums\AppointmentSource;
use App\Enums\AppointmentStatus;
use App\Events\AppointmentBooked;
use App\Events\AppointmentStatusChanged;
use App\Models\Appointment;
use App\Models\User;
use App\Services\Support\AuditLogger;
use App\Services\Support\ReferenceNumberGenerator;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

/**
 * Appointment workflow (Step 3 §6, Step 7 §3). B3: booking and cancelling;
 * confirm / reschedule / check-in / no-show follow with the admin endpoints.
 */
final class AppointmentService
{
    public function __construct(
        private readonly BookingRules $rules,
        private readonly ReferenceNumberGenerator $references,
        private readonly AuditLogger $audit,
    ) {}

    /**
     * Create a booking. $data is validated input with a normalised phone and
     * a resolved service_id. A logged-in customer's booking is linked to
     * their customer profile.
     *
     * @param  array<string, mixed>  $data
     *
     * @throws ConflictHttpException when the same car is already booked for that day
     */
    public function book(array $data, ?User $user = null, AppointmentSource $source = AppointmentSource::Website): Appointment
    {
        $date = CarbonImmutable::parse($data['preferred_date'], config('app.business_timezone'));
        $this->rules->assertBookable($date);

        $registration = Appointment::normalizeRegistration($data['registration_number']);

        $appointment = DB::transaction(function () use ($data, $user, $source, $date, $registration) {
            // Same phone + same day + same car while an earlier booking is still open (Step 3 §6.1).
            $duplicate = Appointment::query()
                ->where('registration_number_normalized', $registration)
                ->whereDate('preferred_date', $date->toDateString())
                ->where('contact_phone', $data['contact_phone'])
                ->whereIn('status', AppointmentStatus::active())
                ->lockForUpdate()
                ->exists();

            if ($duplicate) {
                throw new ConflictHttpException('You already have a booking for this date.');
            }

            $appointment = Appointment::create([
                'reference' => $this->references->next(ReferenceNumberGenerator::APPOINTMENT),
                'customer_id' => $user?->customer?->id,
                'service_id' => $data['service_id'] ?? null,
                'contact_name' => $data['contact_name'],
                'contact_phone' => $data['contact_phone'],
                'contact_email' => $data['contact_email'] ?? null,
                'vehicle_brand' => $data['vehicle_brand'],
                'vehicle_model' => $data['vehicle_model'],
                'registration_number' => $data['registration_number'],
                'registration_number_normalized' => $registration,
                'preferred_date' => $date->toDateString(),
                'notes' => $data['notes'] ?? null,
                'status' => AppointmentStatus::Pending,
                'source' => $source,
                'created_by' => $source === AppointmentSource::Staff ? $user?->id : null,
            ]);

            $this->audit->log('appointment.booked', $appointment, null, [
                'status' => AppointmentStatus::Pending->value,
                'preferred_date' => $appointment->preferred_date->toDateString(),
                'source' => $source->value,
            ]);

            return $appointment;
        });

        AppointmentBooked::dispatch($appointment);

        return $appointment;
    }

    /**
     * Whether the customer may still cancel online: pending or confirmed,
     * and the appointment date is still ahead (Step 3 §6.2).
     */
    public function customerCanCancel(Appointment $appointment): bool
    {
        return in_array($appointment->status, AppointmentStatus::active(), true)
            && $appointment->preferred_date->toDateString() > $this->rules->today()->toDateString();
    }

    /**
     * Cancel a booking. Customers may only cancel before the date; staff must give a reason.
     *
     * @throws ConflictHttpException when the booking can no longer be cancelled
     */
    public function cancel(Appointment $appointment, ?string $reason = null, bool $byCustomer = false): Appointment
    {
        $allowed = $byCustomer
            ? $this->customerCanCancel($appointment)
            : in_array($appointment->status, AppointmentStatus::active(), true);

        if (! $allowed) {
            throw new ConflictHttpException($byCustomer
                ? 'This booking can no longer be cancelled online. Please call us.'
                : 'Only pending or confirmed bookings can be cancelled.');
        }

        $from = $appointment->status;

        DB::transaction(function () use ($appointment, $reason, $byCustomer, $from) {
            $appointment->update([
                'status' => AppointmentStatus::Cancelled,
                'cancellation_reason' => $reason,
                'cancelled_at' => now(),
            ]);

            $this->audit->log(
                'appointment.cancelled',
                $appointment,
                ['status' => $from->value],
                ['status' => AppointmentStatus::Cancelled->value, 'by' => $byCustomer ? 'customer' : 'staff'],
                $reason,
            );
        });

        AppointmentStatusChanged::dispatch($appointment, 'cancelled', $from, $byCustomer);

        return $appointment;
    }
}
