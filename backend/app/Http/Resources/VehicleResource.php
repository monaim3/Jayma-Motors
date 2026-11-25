<?php

namespace App\Http\Resources;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A vehicle's own fields (customer portal and admin).
 *
 * @mixin Vehicle
 */
class VehicleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vehicle_brand_id' => $this->vehicle_brand_id,
            'brand_name' => $this->brand_name,
            'model' => $this->model,
            'year' => $this->year,
            'registration_number' => $this->registration_number,
            'chassis_number' => $this->chassis_number,
            'color' => $this->color,
            'fuel_type' => $this->fuel_type?->value,
            'archived' => $this->archived_at !== null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
