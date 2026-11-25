<?php

namespace App\Http\Requests;

use App\Enums\FuelType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Vehicle fields (Step 3 §5): brand (from the list, or free text for
 * "Other"), model, year, registration number required; colour, chassis
 * number, fuel type optional. On PATCH every field is optional.
 */
class VehicleRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $required = $this->isMethod('PATCH') ? 'sometimes' : 'required';

        return [
            'vehicle_brand_id' => ['nullable', 'integer', Rule::exists('vehicle_brands', 'id')->where('is_active', true)],
            'brand_name' => [$this->isMethod('PATCH') ? 'sometimes' : 'required_without:vehicle_brand_id', 'nullable', 'string', 'max:60'],
            'model' => [$required, 'string', 'max:80'],
            'year' => ['nullable', 'integer', 'between:1950,'.(now()->year + 1)],
            'registration_number' => [$required, 'string', 'min:3', 'max:40'],
            'chassis_number' => ['nullable', 'string', 'max:40'],
            'color' => ['nullable', 'string', 'max:30'],
            'fuel_type' => ['nullable', Rule::enum(FuelType::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'brand_name.required_without' => 'Choose the car brand.',
            'model.required' => 'Enter the car model.',
            'registration_number.required' => 'Enter the car number.',
            'year.between' => 'Enter a year between 1950 and '.(now()->year + 1).'.',
        ];
    }
}
