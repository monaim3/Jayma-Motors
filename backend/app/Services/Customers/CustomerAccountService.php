<?php

namespace App\Services\Customers;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;

/**
 * Customer accounts (Step 3 §4, Step 7 §3).
 *
 * B1: register(). Walk-in linking (linkWalkInByVerifiedEmail, linkManually,
 * possibleMatches) and deactivate() arrive with the customers module (B4);
 * auto-linking listens for the Verified event fired on email verification.
 */
class CustomerAccountService
{
    /**
     * Online sign-up: a users row with the customer role plus its customers
     * profile, in one transaction. Fires Registered (sends the verification email).
     *
     * @param  array{name: string, phone: string, email: string, password: string}  $data  phone already normalised
     */
    public function register(array $data): User
    {
        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'password' => $data['password'],
                'status' => UserStatus::Active,
            ]);

            $user->assignRole(Role::Customer->value);

            Customer::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
            ]);

            return $user;
        });

        event(new Registered($user));

        return $user;
    }
}
