<?php

namespace App\Services\Vehicles;

use App\Models\Customer;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use App\Models\VehicleOwnership;
use App\Services\Support\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

/**
 * Vehicles (Step 3 §5, Step 7 §3): the normalised registration number is
 * unique across the system, every vehicle has an ownership history, and a
 * car with workshop history is archived instead of deleted.
 */
final class VehicleService
{
    public const ALREADY_REGISTERED = 'This vehicle is already registered. Please contact Jayma Motors.';

    public function __construct(private readonly AuditLogger $audit) {}

    /**
     * @param  array<string, mixed>  $data  validated vehicle fields
     *
     * @throws ConflictHttpException when the registration number is already in the system
     */
    public function addForCustomer(Customer $customer, array $data, ?User $by = null): Vehicle
    {
        $fields = $this->fields($data);
        $this->assertRegistrationFree($fields['registration_number_normalized']);
        $this->assertChassisFree($fields['chassis_number'] ?? null);

        return DB::transaction(function () use ($customer, $fields, $by) {
            $vehicle = Vehicle::create([...$fields, 'customer_id' => $customer->id]);

            VehicleOwnership::create([
                'vehicle_id' => $vehicle->id,
                'customer_id' => $customer->id,
                'started_at' => now(),
                'transferred_by' => $by?->isStaff() ? $by->id : null,
            ]);

            $this->audit->log('vehicle.created', $vehicle, null, $this->auditValues($vehicle));

            return $vehicle;
        });
    }

    /**
     * @param  array<string, mixed>  $data  validated fields to change
     */
    public function update(Vehicle $vehicle, array $data): Vehicle
    {
        $fields = $this->fields([...$this->current($vehicle), ...$data]);

        if ($fields['registration_number_normalized'] !== $vehicle->registration_number_normalized) {
            $this->assertRegistrationFree($fields['registration_number_normalized'], $vehicle->id);
        }
        if (($fields['chassis_number'] ?? null) !== $vehicle->chassis_number) {
            $this->assertChassisFree($fields['chassis_number'] ?? null, $vehicle->id);
        }

        $old = $this->auditValues($vehicle);
        $vehicle->update($fields);
        $new = $this->auditValues($vehicle);

        $changed = array_diff_assoc(array_map('strval', $new), array_map('strval', $old));
        if ($changed !== []) {
            $this->audit->log('vehicle.updated', $vehicle, array_intersect_key($old, $changed), array_intersect_key($new, $changed));
        }

        return $vehicle;
    }

    /**
     * Customer removes a car (Step 3 §5): deleted when it has no workshop
     * history, otherwise archived (hidden from them, history kept).
     *
     * @return 'deleted'|'archived'
     */
    public function archiveOrDelete(Vehicle $vehicle): string
    {
        if ($vehicle->hasHistory()) {
            $vehicle->update(['archived_at' => now()]);
            $this->audit->log('vehicle.archived', $vehicle);

            return 'archived';
        }

        $this->audit->log('vehicle.deleted', $vehicle, $this->auditValues($vehicle));
        $vehicle->delete();

        return 'deleted';
    }

    /**
     * Booking by a logged-in customer with a car that isn't saved yet
     * (Step 3 §6.1): save it to their account. Returns the vehicle when it is
     * (or already was) theirs; null when the number belongs to someone else.
     *
     * @param  array{vehicle_brand: string, vehicle_model: string, registration_number: string}  $booking
     */
    public function rememberFromBooking(Customer $customer, array $booking): ?Vehicle
    {
        $normalized = Vehicle::normalizeRegistration($booking['registration_number']);
        $existing = Vehicle::query()->where('registration_number_normalized', $normalized)->first();

        if ($existing) {
            return $existing->customer_id === $customer->id && $existing->archived_at === null ? $existing : null;
        }

        return $this->addForCustomer($customer, [
            'brand_name' => $booking['vehicle_brand'],
            'model' => $booking['vehicle_model'],
            'registration_number' => $booking['registration_number'],
        ]);
    }

    /**
     * Normalise the fields: brand name from the brands list when an id is
     * given (free text otherwise), registration number as entered + normalised.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function fields(array $data): array
    {
        $brandId = $data['vehicle_brand_id'] ?? null;
        $brandName = $brandId ? VehicleBrand::query()->whereKey($brandId)->value('name') : null;
        $brandName ??= trim((string) ($data['brand_name'] ?? ''));
        $brandId ??= VehicleBrand::query()->where('name', $brandName)->value('id');

        $registration = preg_replace('/\s+/', ' ', trim((string) $data['registration_number']));
        $chassis = isset($data['chassis_number']) ? strtoupper(trim((string) $data['chassis_number'])) : null;

        return [
            'vehicle_brand_id' => $brandId,
            'brand_name' => $brandName,
            'model' => trim((string) $data['model']),
            'year' => $data['year'] ?? null,
            'registration_number' => $registration,
            'registration_number_normalized' => Vehicle::normalizeRegistration($registration),
            'chassis_number' => $chassis === '' ? null : $chassis,
            'color' => isset($data['color']) && trim((string) $data['color']) !== '' ? trim((string) $data['color']) : null,
            'fuel_type' => $data['fuel_type'] ?? null,
        ];
    }

    /** @return array<string, mixed> */
    private function current(Vehicle $vehicle): array
    {
        return [
            'vehicle_brand_id' => $vehicle->vehicle_brand_id,
            'brand_name' => $vehicle->brand_name,
            'model' => $vehicle->model,
            'year' => $vehicle->year,
            'registration_number' => $vehicle->registration_number,
            'chassis_number' => $vehicle->chassis_number,
            'color' => $vehicle->color,
            'fuel_type' => $vehicle->fuel_type?->value,
        ];
    }

    /** @return array<string, mixed> */
    private function auditValues(Vehicle $vehicle): array
    {
        return [...$this->current($vehicle), 'customer_id' => $vehicle->customer_id];
    }

    private function assertRegistrationFree(string $normalized, ?int $ignoreId = null): void
    {
        $taken = Vehicle::query()
            ->where('registration_number_normalized', $normalized)
            ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists();

        if ($taken) {
            throw new ConflictHttpException(self::ALREADY_REGISTERED);
        }
    }

    private function assertChassisFree(?string $chassis, ?int $ignoreId = null): void
    {
        if ($chassis === null || $chassis === '') {
            return;
        }

        $taken = Vehicle::query()
            ->where('chassis_number', strtoupper($chassis))
            ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists();

        if ($taken) {
            throw ValidationException::withMessages(['chassis_number' => 'This chassis number is already registered to another vehicle.']);
        }
    }
}
