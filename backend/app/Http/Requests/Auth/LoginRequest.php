<?php

namespace App\Http\Requests\Auth;

use App\Services\Support\PhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

/**
 * POST /auth/login — customers (Step 3 §4.2): one field takes phone or email.
 */
class LoginRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'login' => ['required', 'string', 'max:191'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * The users column and value to look up: contains "@" → email, otherwise phone.
     * Returns null when the phone is not a valid BD number (treated as wrong credentials).
     *
     * @return array{0: string, 1: string}|null
     */
    public function identifier(): ?array
    {
        $login = trim($this->string('login'));

        if (str_contains($login, '@')) {
            return ['email', Str::lower($login)];
        }

        $phone = PhoneNumber::normalize($login);

        return $phone === null ? null : ['phone', $phone];
    }
}
