<?php

namespace App\Models;

use App\Enums\AppointmentSource;
use App\Enums\AppointmentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A booking request (Step 4 §7.1, Step 3 §6). Contact and vehicle fields
 * are snapshots; customer_id links it to a customer profile when known.
 */
#[Fillable([
    'reference', 'customer_id', 'vehicle_id', 'service_id',
    'contact_name', 'contact_phone', 'contact_email',
    'vehicle_brand', 'vehicle_model', 'registration_number', 'registration_number_normalized',
    'preferred_date', 'time_note', 'notes', 'status', 'source',
    'cancellation_reason', 'confirmed_at', 'cancelled_at', 'created_by',
])]
class Appointment extends Model
{
    protected function casts(): array
    {
        return [
            'preferred_date' => 'date:Y-m-d',
            'status' => AppointmentStatus::class,
            'source' => AppointmentSource::class,
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /** "Dhaka Metro Ga 12-3456" → "DHAKAMETROGA123456" (duplicate check, search). */
    public static function normalizeRegistration(string $value): string
    {
        return strtoupper(preg_replace('/[^A-Za-z0-9\x{0980}-\x{09FF}]/u', '', $value));
    }

    /** @return BelongsTo<Customer, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /** @return BelongsTo<Vehicle, $this> */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /** @return BelongsTo<Service, $this> */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /** Staff member who entered a phone/walk-in booking. */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
