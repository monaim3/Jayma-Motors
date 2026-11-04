<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class SuperAdminSeeder extends Seeder
{
    /**
     * Creates the first Super Admin from SUPER_ADMIN_* environment values.
     * Never overwrites the password of an existing account.
     */
    public function run(): void
    {
        $email = strtolower((string) config('app.super_admin.email'));
        $password = (string) config('app.super_admin.password');

        if ($email === '' || $password === '') {
            throw new RuntimeException('Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env before seeding.');
        }

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => config('app.super_admin.name'),
                'password' => $password,
                'status' => UserStatus::Active,
                'email_verified_at' => now(),
            ],
        );

        $user->syncRoles([Role::SuperAdmin->value]);
    }
}
