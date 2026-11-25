<?php

namespace App\Http\Resources\Admin;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Services\Appointments\BookingRules;
use App\Services\Support\PhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A booking for the admin panel (Step 7 §11.2). `withTimeline()` adds the
 * full audit trail (who did what, when, and why) on the detail endpoint.
 *
 * @mixin Appointment
 */
class AppointmentResource extends JsonResource
{
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
        $today = app(BookingRules::class)->today()->toDateString();
        $date = $this->preferred_date->toDateString();
        $active = in_array($this->status, AppointmentStatus::active(), true);

        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'source' => $this->source->value,
            'preferred_date' => $date,
            'time_note' => $this->time_note,
            'contact' => [
                'name' => $this->contact_name,
                'phone' => $this->contact_phone,
                'phone_display' => PhoneNumber::display($this->contact_phone),
                'email' => $this->contact_email,
            ],
            'vehicle' => [
                'brand' => $this->vehicle_brand,
                'model' => $this->vehicle_model,
                'registration_number' => $this->registration_number,
            ],
            'service' => $this->service ? ['id' => $this->service->id, 'name' => $this->service->name] : null,
            'customer' => $this->customer ? [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'has_account' => $this->customer->user_id !== null,
            ] : null,
            'notes' => $this->notes,
            'cancellation_reason' => $this->cancellation_reason,
            'created_by' => $this->creator?->name,
            'created_at' => $this->created_at?->toIso8601String(),
            'confirmed_at' => $this->confirmed_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            // What the staff screen may offer right now (the API still checks).
            'actions' => [
                'confirm' => $this->status === AppointmentStatus::Pending,
                'reschedule' => $active,
                'cancel' => $active,
                'check_in' => $this->status === AppointmentStatus::Confirmed && $date <= $today,
                'no_show' => $this->status === AppointmentStatus::Confirmed && $date <= $today,
            ],
            'timeline' => $this->when($this->timeline, fn () => AuditLog::query()
                ->with('user:id,name')
                ->where('auditable_type', $this->resource->getMorphClass())
                ->where('auditable_id', $this->id)
                ->orderBy('created_at')
                ->orderBy('id')
                ->get()
                ->map(fn (AuditLog $log) => [
                    'event' => $log->event,
                    'by' => $log->user?->name,
                    'note' => $log->note,
                    'old' => $log->old_values,
                    'new' => $log->new_values,
                    'at' => $log->created_at?->toIso8601String(),
                ])
                ->all()),
        ];
    }
}
