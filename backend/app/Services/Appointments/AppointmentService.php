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
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

/**
 * Appointment workflow (Step 3 §6, Step 7 §3): book, confirm, reschedule,
 * cancel, check-in, no-show and the nightly expiry. Only valid transitions
 * are allowed (409 otherwise); every change is audited.
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

            // Staff bookings may be confirmed straight away (Step 3 §6.2).
            $confirmed = $source === AppointmentSource::Staff && ! empty($data['confirm']);
            $status = $confirmed ? AppointmentStatus::Confirmed : AppointmentStatus::Pending;

            $appointment = Appointment::create([
                'reference' => $this->references->next(ReferenceNumberGenerator::APPOINTMENT),
                'customer_id' => $data['customer_id'] ?? $user?->customer?->id,
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
                'time_note' => $confirmed ? ($data['time_note'] ?? null) : null,
                'status' => $status,
                'confirmed_at' => $confirmed ? now() : null,
                'source' => $source,
                'created_by' => $source === AppointmentSource::Staff ? $user?->id : null,
            ]);

            $this->audit->log('appointment.booked', $appointment, null, [
                'status' => $status->value,
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

    /** Pending → Confirmed, optionally with a time note such as "10:30 AM". */
    public function confirm(Appointment $appointment, ?string $timeNote = null): Appointment
    {
        $this->assertStatus($appointment, [AppointmentStatus::Pending], 'Only pending bookings can be confirmed.');

        return $this->transition($appointment, 'confirmed', [
            'status' => AppointmentStatus::Confirmed,
            'confirmed_at' => now(),
            'time_note' => $timeNote ?? $appointment->time_note,
        ]);
    }

    /** Move a pending or confirmed booking to a new date (status unchanged); reason recorded. */
    public function reschedule(Appointment $appointment, string $date, string $reason, ?string $timeNote = null): Appointment
    {
        $this->assertStatus($appointment, AppointmentStatus::active(), 'Only pending or confirmed bookings can be rescheduled.');

        $newDate = CarbonImmutable::parse($date, config('app.business_timezone'));
        if ($newDate->toDateString() === $appointment->preferred_date->toDateString()) {
            throw ValidationException::withMessages(['preferred_date' => 'Choose a different date.']);
        }
        $this->rules->assertBookable($newDate);

        return $this->transition($appointment, 'rescheduled', [
            'preferred_date' => $newDate->toDateString(),
            'time_note' => $timeNote,
        ], $reason);
    }

    /**
     * Confirmed → Checked-in, from the appointment day. The service record that
     * check-in opens (Step 3 §6.2) is added with service records (B5).
     */
    public function checkIn(Appointment $appointment): Appointment
    {
        $this->assertStatus($appointment, [AppointmentStatus::Confirmed], 'Only confirmed bookings can be checked in.');
        if ($appointment->preferred_date->toDateString() > $this->rules->today()->toDateString()) {
            throw new ConflictHttpException('Check-in opens on the appointment day. Reschedule it to today first.');
        }

        return $this->transition($appointment, 'checked_in', ['status' => AppointmentStatus::CheckedIn]);
    }

    /** Confirmed → No-show, only on or after the appointment date. */
    public function markNoShow(Appointment $appointment): Appointment
    {
        $this->assertStatus($appointment, [AppointmentStatus::Confirmed], 'Only confirmed bookings can be marked as no-show.');
        if ($appointment->preferred_date->toDateString() > $this->rules->today()->toDateString()) {
            throw new ConflictHttpException('A booking can only be marked as no-show on or after its date.');
        }

        return $this->transition($appointment, 'no_show', ['status' => AppointmentStatus::NoShow]);
    }

    /** Nightly: pending bookings whose date has passed become Expired (Step 3 §6.2). */
    public function expirePast(): int
    {
        $expired = 0;

        Appointment::query()
            ->where('status', AppointmentStatus::Pending)
            ->whereDate('preferred_date', '<', $this->rules->today()->toDateString())
            ->each(function (Appointment $appointment) use (&$expired) {
                $this->transition($appointment, 'expired', ['status' => AppointmentStatus::Expired], notify: false);
                $expired++;
            });

        return $expired;
    }

    /**
     * @param  list<AppointmentStatus>  $allowed
     */
    private function assertStatus(Appointment $appointment, array $allowed, string $message): void
    {
        if (! in_array($appointment->status, $allowed, true)) {
            throw new ConflictHttpException($message);
        }
    }

    /**
     * Save a change, audit it ("appointment.<action>") and announce it.
     *
     * @param  array<string, mixed>  $changes
     */
    private function transition(Appointment $appointment, string $action, array $changes, ?string $note = null, bool $notify = true): Appointment
    {
        $from = $appointment->status;
        $fields = array_values(array_diff(array_keys($changes), ['confirmed_at']));
        $old = self::plain($appointment->only($fields));

        DB::transaction(function () use ($appointment, $action, $changes, $note, $old, $fields) {
            $appointment->update($changes);
            $this->audit->log("appointment.{$action}", $appointment, $old, self::plain($appointment->only($fields)), $note);
        });

        if ($notify) {
            AppointmentStatusChanged::dispatch($appointment, $action, $from);
        }

        return $appointment;
    }

    /**
     * Enums and dates as plain values for the audit log.
     *
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    private static function plain(array $values): array
    {
        return array_map(fn ($value) => match (true) {
            $value instanceof \BackedEnum => $value->value,
            $value instanceof \DateTimeInterface => $value->format('Y-m-d'),
            default => $value,
        }, $values);
    }
}
