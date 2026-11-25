<?php

namespace App\Http\Resources\Customer;

use App\Models\Appointment;
use App\Models\AuditLog;
use App\Services\Appointments\AppointmentService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A booking as its customer sees it (Step 7 §10). The status timeline is
 * added on the detail endpoint only (`withTimeline()`), never staff notes.
 *
 * @mixin Appointment
 */
class AppointmentResource extends JsonResource
{
    private const TIMELINE_LABELS = [
        'appointment.booked' => 'Booking received',
        'appointment.confirmed' => 'Confirmed by the workshop',
        'appointment.rescheduled' => 'Date changed',
        'appointment.cancelled' => 'Cancelled',
        'appointment.checked_in' => 'Car checked in',
        'appointment.no_show' => 'Marked as missed',
        'appointment.expired' => 'Expired (not confirmed in time)',
    ];

    private bool $timeline = false;

    public function withTimeline(): static
    {
        $this->timeline = true;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'reference' => $this->reference,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'preferred_date' => $this->preferred_date->toDateString(),
            'time_note' => $this->time_note,
            'service' => $this->service ? ['name' => $this->service->name, 'slug' => $this->service->slug] : null,
            'vehicle' => [
                'brand' => $this->vehicle_brand,
                'model' => $this->vehicle_model,
                'registration_number' => $this->registration_number,
            ],
            'notes' => $this->notes,
            'cancellation_reason' => $this->cancellation_reason,
            'can_cancel' => app(AppointmentService::class)->customerCanCancel($this->resource),
            'created_at' => $this->created_at?->toIso8601String(),
            'timeline' => $this->when($this->timeline, fn () => AuditLog::query()
                ->where('auditable_type', $this->resource->getMorphClass())
                ->where('auditable_id', $this->id)
                ->whereIn('event', array_keys(self::TIMELINE_LABELS))
                ->orderBy('created_at')
                ->orderBy('id')
                ->get()
                ->map(fn (AuditLog $log) => [
                    'event' => $log->event,
                    'label' => self::TIMELINE_LABELS[$log->event],
                    'at' => $log->created_at?->toIso8601String(),
                ])
                ->all()),
        ];
    }
}
