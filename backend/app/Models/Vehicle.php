<?php

namespace App\Models;

use App\Enums\FuelType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A customer's car (Step 4 §5.2). The normalised registration number is
 * unique across the system. Vehicles with history are archived, never deleted.
 */
#[Fillable([
    'customer_id', 'vehicle_brand_id', 'brand_name', 'model', 'year',
    'registration_number', 'registration_number_normalized', 'chassis_number',
    'color', 'fuel_type', 'archived_at',
])]
class Vehicle extends Model
{
    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'fuel_type' => FuelType::class,
            'archived_at' => 'datetime',
        ];
    }

    /** Same rule as bookings: "Dhaka Metro Ga 12-3456" → "DHAKAMETROGA123456". */
    public static function normalizeRegistration(string $value): string
    {
        return Appointment::normalizeRegistration($value);
    }

    /** @param  Builder<self>  $query */
    public function scopeActive(Builder $query): void
    {
        $query->whereNull('archived_at');
    }

    /** Current owner. */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(VehicleBrand::class, 'vehicle_brand_id');
    }

    /** @return HasMany<VehicleOwnership, $this> */
    public function ownerships(): HasMany
    {
        return $this->hasMany(VehicleOwnership::class)->orderBy('started_at');
    }

    /** @return HasMany<Appointment, $this> */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Whether the car has workshop history, so it may only be archived
     * (Step 3 §5). Service records (B5) extend this check.
     */
    public function hasHistory(): bool
    {
        return $this->appointments()->exists();
    }
}
