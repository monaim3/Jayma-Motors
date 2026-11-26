<?php

namespace App\Http\Requests\Public;

use App\Models\Service;
use App\Services\Support\PhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Validator;

/**
 * POST /appointments (Step 7 §9). Signed-in customers only (owner,
 * 2026-11-26); the booking is linked to their profile. The service can be
 * sent as its slug (website form) or its id. `website` is a honeypot.
 * Names and car details may not contain web links: they are shown in emails.
 */
class StoreAppointmentRequest extends FormRequest
{
    /** No web links in short text fields (they appear in emails sent from our domain). */
    public const NO_LINKS = 'not_regex:/(https?:|:\/\/|www\.)/i';

    private ?Service $service = null;

    protected function prepareForValidation(): void
    {
        $trim = fn (string $key) => is_string($this->input($key)) ? trim($this->input($key)) : $this->input($key);
        $phone = $this->input('contact_phone');
        $email = $trim('contact_email');

        $this->merge([
            'contact_name' => $trim('contact_name'),
            'contact_phone' => is_string($phone) ? (PhoneNumber::normalize($phone) ?? trim($phone)) : $phone,
            'contact_email' => $email === '' ? null : (is_string($email) ? Str::lower($email) : $email),
            'vehicle_brand' => $trim('vehicle_brand'),
            'vehicle_model' => $trim('vehicle_model'),
            'registration_number' => is_string($this->input('registration_number'))
                ? preg_replace('/\s+/', ' ', trim($this->input('registration_number')))
                : $this->input('registration_number'),
            'notes' => $trim('notes') === '' ? null : $trim('notes'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'contact_name' => ['required', 'string', 'min:2', 'max:100', self::NO_LINKS],
            'contact_phone' => [
                'required',
                'string',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (! PhoneNumber::isValid($value)) {
                        $fail('Enter a valid Bangladeshi mobile number, e.g. 01711-949110.');
                    }
                },
            ],
            'contact_email' => ['nullable', 'string', 'email', 'max:191'],
            'preferred_date' => ['required', 'date_format:Y-m-d'],
            // A logged-in customer may pick one of their saved cars instead (B4).
            'vehicle_id' => ['nullable', 'integer'],
            'vehicle_brand' => ['required_without:vehicle_id', 'nullable', 'string', 'max:60', self::NO_LINKS],
            'vehicle_model' => ['required_without:vehicle_id', 'nullable', 'string', 'max:80', self::NO_LINKS],
            'registration_number' => ['required_without:vehicle_id', 'nullable', 'string', 'min:3', 'max:40', self::NO_LINKS],
            'service' => ['required_without:service_id', 'nullable', 'string', 'max:120'],
            'service_id' => ['required_without:service', 'nullable', 'integer'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'website' => ['nullable', 'max:0'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->hasAny(['service', 'service_id'])) {
                    return;
                }

                $this->service = Service::query()
                    ->published()
                    ->where('is_bookable', true)
                    ->when(
                        $this->filled('service_id'),
                        fn ($query) => $query->whereKey($this->integer('service_id')),
                        fn ($query) => $query->where('slug', $this->input('service')),
                    )
                    ->first();

                if ($this->service === null) {
                    $validator->errors()->add('service', 'Please choose a service from the list.');
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'contact_name.required' => 'Please enter your name.',
            '*.not_regex' => 'Please remove the web link from this field.',
            'preferred_date.required' => 'Please choose a date.',
            'vehicle_brand.required_without' => 'Please choose your car brand.',
            'vehicle_model.required_without' => 'Please enter your car model.',
            'registration_number.required_without' => 'Please enter your car number.',
            'service.required_without' => 'Please choose a service.',
            'website.max' => 'Your booking could not be sent.',
        ];
    }

    /**
     * Validated booking data with the resolved service id.
     *
     * @return array<string, mixed>
     */
    public function bookingData(): array
    {
        return [
            ...$this->safe()->except(['service', 'website']),
            'service_id' => $this->service?->id,
        ];
    }
}
