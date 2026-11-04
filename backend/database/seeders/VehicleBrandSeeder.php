<?php

namespace Database\Seeders;

use App\Models\VehicleBrand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VehicleBrandSeeder extends Seeder
{
    /**
     * Brand list approved in Step 4 (S1). "Other" is always last.
     */
    private const BRANDS = [
        'Toyota', 'Honda', 'Nissan', 'Mitsubishi', 'Mazda', 'Suzuki', 'Subaru', 'Lexus',
        'Hyundai', 'Kia', 'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Land Rover',
        'Ford', 'Proton', 'Tata', 'MG', 'Other',
    ];

    public function run(): void
    {
        foreach (self::BRANDS as $index => $name) {
            VehicleBrand::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'sort_order' => ($index + 1) * 10, 'is_active' => true],
            );
        }
    }
}
