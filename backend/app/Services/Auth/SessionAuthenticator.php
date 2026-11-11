<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Cookie-session login for the Next.js frontend (Sanctum SPA, Step 1 §7.1).
 *
 * The same message is used for an unknown account, a wrong password and an
 * account of the wrong kind (customer vs staff), so the response never reveals
 * whether a phone or email is registered (Step 3 §4.2).
 */
class SessionAuthenticator
{
    public const FAILED = 'These credentials do not match our records.';

    public const INACTIVE = 'This account has been deactivated. Please contact Jayma Motors.';

    /**
     * @param  'customer'|'staff'  $kind
     *
     * @throws ValidationException
     */
    public function attempt(Request $request, string $column, ?string $value, string $password, bool $remember, string $kind, string $errorField): User
    {
        $user = $value === null ? null : User::where($column, $value)->first();

        // Hash even when the account is unknown, so response time doesn't reveal it.
        $passwordOk = Hash::check($password, $user?->password ?? '$2y$12$'.str_repeat('a', 53));

        if (! $user || ! $passwordOk || ! $this->isKind($user, $kind)) {
            throw ValidationException::withMessages([$errorField => self::FAILED]);
        }

        if (! $user->isActive()) {
            throw ValidationException::withMessages([$errorField => self::INACTIVE]);
        }

        Auth::guard('web')->login($user, $remember);
        $request->session()->regenerate();

        $user->forceFill(['last_login_at' => now()])->saveQuietly();

        return $user;
    }

    public function logout(Request $request): void
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    private function isKind(User $user, string $kind): bool
    {
        return $kind === 'staff' ? $user->isStaff() : $user->isCustomer();
    }
}
