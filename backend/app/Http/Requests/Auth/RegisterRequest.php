<?php

namespace App\Http\Requests\Auth;

use App\Services\Support\PhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * POST /auth/register (Step 3 §4.1): phone and email must not already be used.
 */
class RegisterRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $phone = $this->input('phone');

        $this->merge([
            'name' => is_string($this->input('name')) ? trim($this->input('name')) : $this->input('name'),
            'email' => is_string($this->input('email')) ? Str::lower(trim($this->input('email'))) : $this->input('email'),
            // Normalised so the unique check compares like with like; invalid input is kept for the error.
            'phone' => is_string($phone) ? (PhoneNumber::normalize($phone) ?? $phone) : $phone,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'phone' => [
                'required',
                'string',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (! PhoneNumber::isValid($value)) {
                        $fail('Enter a valid Bangladeshi mobile number, e.g. 01711-949110.');
                    }
                },
                Rule::unique('users', 'phone'),
            ],
            'email' => ['required', 'string', 'email', 'max:191', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
            'accept_terms' => ['accepted'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.unique' => 'This phone number is already registered. Try logging in instead.',
            'email.unique' => 'This email is already registered. Try logging in instead.',
            'accept_terms.accepted' => 'Please accept the terms and privacy policy.',
        ];
    }
}
