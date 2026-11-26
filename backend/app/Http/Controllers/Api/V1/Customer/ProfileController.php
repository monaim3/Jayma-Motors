<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Services\Support\AuditLogger;
use App\Services\Support\PhoneNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Customer portal — profile and password (Step 7 §10, Step 3 §4.5).
 * Name and email are editable (a new email must be verified again); the
 * phone is a login identifier and is changed by staff only.
 */
class ProfileController extends Controller
{
    private const EMAIL_CHANGES_PER_HOUR = 3;

    /** GET /me/profile */
    public function show(Request $request): JsonResponse
    {
        return $this->profile($request);
    }

    /** PATCH /me/profile — name, email */
    public function update(Request $request, AuditLogger $audit): JsonResponse
    {
        $user = $request->user();
        // Tidy only the fields that were sent (PATCH may send just one of them).
        if (is_string($request->input('name'))) {
            $request->merge(['name' => trim($request->input('name'))]);
        }
        if (is_string($request->input('email'))) {
            $request->merge(['email' => Str::lower(trim($request->input('email')))]);
        }
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:191', Rule::unique('users', 'email')->ignore($user->id)],
        ], [
            'email.unique' => 'This email is already used by another account.',
        ]);

        $emailChanged = isset($data['email']) && $data['email'] !== $user->email;
        $old = $user->only(array_keys($data));

        // Every email change sends a verification mail: limit it so the form
        // can't be used to flood someone's inbox from our domain.
        if ($emailChanged) {
            $key = 'email-change|'.$user->id;
            if (RateLimiter::tooManyAttempts($key, self::EMAIL_CHANGES_PER_HOUR)) {
                return response()->json([
                    'message' => 'Too many email changes. Please try again later.',
                    'errors' => ['email' => ['Too many email changes. Please try again in an hour.']],
                ], 429);
            }
            RateLimiter::hit($key, 3600);
        }

        DB::transaction(function () use ($user, $data, $emailChanged, $audit, $old) {
            $user->fill($data);
            if ($emailChanged) {
                $user->email_verified_at = null;
            }
            $user->save();
            $user->customer?->update(array_intersect_key($data, array_flip(['name', 'email'])));

            if ($user->wasChanged()) {
                $audit->log('profile.updated', $user, $old, $user->only(array_keys($data)));
            }
        });

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        return $this->profile($request);
    }

    /** PUT /me/password — current_password, password, password_confirmation */
    public function password(Request $request, AuditLogger $audit): JsonResponse
    {
        $user = $request->user();
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
        ]);

        if (! Hash::check($request->input('current_password'), $user->password)) {
            return response()->json([
                'message' => 'Your current password is not correct.',
                'errors' => ['current_password' => ['Your current password is not correct.']],
            ], 422);
        }

        $user->update(['password' => $request->input('password')]);
        $audit->log('profile.password_changed', $user);

        return response()->json(['message' => 'Password changed.']);
    }

    private function profile(Request $request): JsonResponse
    {
        $user = $request->user()->fresh();

        return response()->json([
            'data' => [
                'name' => $user->name,
                'email' => $user->email,
                'email_verified' => $user->hasVerifiedEmail(),
                'phone' => $user->phone,
                'phone_display' => $user->phone ? PhoneNumber::display($user->phone) : null,
            ],
        ]);
    }
}
