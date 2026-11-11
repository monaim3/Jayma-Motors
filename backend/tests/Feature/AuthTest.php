<?php

use App\Enums\Role;
use App\Models\Customer;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

/*
| B1 — Authentication (Step 7 §8, Step 3 §4).
| Requests carry the frontend Origin so Sanctum treats them as SPA (cookie session) calls.
*/

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->withHeaders(['Origin' => 'http://localhost:3000', 'Referer' => 'http://localhost:3000/']);
});

function customer(array $attributes = []): User
{
    return User::factory()->create($attributes)->assignRole(Role::Customer->value);
}

function staff(Role $role = Role::Manager, array $attributes = []): User
{
    return User::factory()->create(['phone' => null, ...$attributes])->assignRole($role->value);
}

function registration(array $overrides = []): array
{
    return [
        'name' => 'Rahim Uddin',
        'phone' => '01711-223344',
        'email' => 'Rahim@Example.com',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
        'accept_terms' => true,
        ...$overrides,
    ];
}

/* Registration */

it('registers a customer, creates the profile, logs in and sends the verification email', function () {
    Notification::fake();

    $this->postJson('/api/v1/auth/register', registration())
        ->assertCreated()
        ->assertJsonPath('data.email', 'rahim@example.com')
        ->assertJsonPath('data.phone', '+8801711223344')
        ->assertJsonPath('data.type', 'customer')
        ->assertJsonPath('data.email_verified', false)
        ->assertJsonPath('data.roles', ['customer']);

    $user = User::where('email', 'rahim@example.com')->sole();
    expect($user->isCustomer())->toBeTrue()
        ->and($user->customer)->toBeInstanceOf(Customer::class)
        ->and($user->customer->phone)->toBe('+8801711223344');

    $this->assertAuthenticatedAs($user);
    Notification::assertSentTo($user, VerifyEmail::class);
});

it('rejects a phone or email that is already registered, in any format', function () {
    customer(['phone' => '+8801711223344', 'email' => 'taken@example.com']);

    $this->postJson('/api/v1/auth/register', registration(['phone' => '8801711 223344', 'email' => 'new@example.com']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('phone');

    $this->postJson('/api/v1/auth/register', registration(['phone' => '01811223344', 'email' => 'TAKEN@example.com']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

it('validates registration input', function (array $overrides, string $field) {
    $this->postJson('/api/v1/auth/register', registration($overrides))
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'invalid phone' => [['phone' => '12345'], 'phone'],
    'short password' => [['password' => 'abc12', 'password_confirmation' => 'abc12'], 'password'],
    'unconfirmed password' => [['password_confirmation' => 'different1'], 'password'],
    'terms not accepted' => [['accept_terms' => false], 'accept_terms'],
    'missing name' => [['name' => ''], 'name'],
]);

/* Customer login */

it('logs a customer in with phone in any format or email', function (string $login) {
    $user = customer(['phone' => '+8801711223344', 'email' => 'rahim@example.com']);

    $this->postJson('/api/v1/auth/login', ['login' => $login, 'password' => 'password'])
        ->assertOk()
        ->assertJsonPath('data.id', $user->id);

    $this->assertAuthenticatedAs($user);
    expect($user->fresh()->last_login_at)->not->toBeNull();
})->with(['01711223344', '01711-223344', '+8801711223344', 'Rahim@Example.com']);

it('gives the same error for a wrong password, an unknown account and a staff account', function () {
    customer(['email' => 'rahim@example.com']);
    staff(attributes: ['email' => 'manager@example.com']);

    foreach ([
        ['login' => 'rahim@example.com', 'password' => 'wrong-pass1'],
        ['login' => 'nobody@example.com', 'password' => 'password'],
        ['login' => '01999999999', 'password' => 'password'],
        ['login' => 'manager@example.com', 'password' => 'password'],
    ] as $credentials) {
        $this->postJson('/api/v1/auth/login', $credentials)
            ->assertUnprocessable()
            ->assertJsonPath('errors.login.0', 'These credentials do not match our records.');
    }

    $this->assertGuest();
});

it('does not let a deactivated customer log in', function () {
    customer(['email' => 'rahim@example.com', 'status' => 'inactive']);

    $this->postJson('/api/v1/auth/login', ['login' => 'rahim@example.com', 'password' => 'password'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.login.0', 'This account has been deactivated. Please contact Jayma Motors.');

    $this->assertGuest();
});

it('limits login attempts to 5 per minute', function () {
    customer(['email' => 'rahim@example.com']);

    foreach (range(1, 5) as $attempt) {
        $this->postJson('/api/v1/auth/login', ['login' => 'rahim@example.com', 'password' => 'wrong-pass1'])
            ->assertUnprocessable();
    }

    $this->postJson('/api/v1/auth/login', ['login' => 'rahim@example.com', 'password' => 'wrong-pass1'])
        ->assertTooManyRequests();
});

/* Staff login */

it('logs staff in by email and returns their permissions', function () {
    $manager = staff(Role::Manager, ['email' => 'manager@example.com']);

    $response = $this->postJson('/api/v1/auth/staff/login', ['email' => 'Manager@Example.com', 'password' => 'password'])
        ->assertOk()
        ->assertJsonPath('data.type', 'staff')
        ->assertJsonPath('data.roles', ['manager']);

    expect($response->json('data.permissions'))->toContain('appointments.manage');
    $this->assertAuthenticatedAs($manager);
});

it('rejects a customer on the staff login', function () {
    customer(['email' => 'rahim@example.com']);

    $this->postJson('/api/v1/auth/staff/login', ['email' => 'rahim@example.com', 'password' => 'password'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'These credentials do not match our records.');
});

/* Session */

it('returns the signed-in user from /me and requires a session', function () {
    $this->getJson('/api/v1/auth/me')->assertUnauthorized();

    $user = customer();
    $this->actingAs($user)->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonStructure(['data' => ['id', 'name', 'email', 'phone', 'email_verified', 'type', 'roles', 'permissions']]);
});

it('logs out', function () {
    $this->actingAs(customer())->postJson('/api/v1/auth/logout')->assertNoContent();

    $this->assertGuest('web');
});

it('signs out an account that was deactivated while logged in', function () {
    $user = customer();
    $user->forceFill(['status' => 'inactive'])->save();

    $this->actingAs($user)->getJson('/api/v1/auth/me')->assertForbidden();
});

/* Email verification */

function verificationPath(User $user, array $overrides = []): string
{
    return URL::temporarySignedRoute('auth.verification.verify', now()->addMinutes(60), [
        'id' => $user->id,
        'hash' => sha1($user->email),
        ...$overrides,
    ], absolute: false);
}

it('emails a verification link that opens the frontend', function () {
    Notification::fake();
    $user = customer(['email_verified_at' => null]);

    $this->actingAs($user)->postJson('/api/v1/auth/email/verification-notification')->assertOk();

    Notification::assertSentTo($user, VerifyEmail::class, function (VerifyEmail $notification) use ($user) {
        $url = $notification->toMail($user)->actionUrl;

        return str_starts_with($url, 'http://localhost:3000/verify-email?')
            && str_contains($url, 'signature=') && str_contains($url, 'expires=');
    });
});

it('verifies the email from a valid signed link', function () {
    Event::fake([Verified::class]);
    $user = customer(['email_verified_at' => null]);

    $this->actingAs($user)->getJson(verificationPath($user))
        ->assertOk()
        ->assertJsonPath('data.email_verified', true);

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    Event::assertDispatched(Verified::class);
});

it('rejects a tampered, expired or someone else\'s verification link', function () {
    $user = customer(['email_verified_at' => null]);
    $other = customer(['email_verified_at' => null]);

    $this->actingAs($user)->getJson(verificationPath($user).'x')->assertForbidden();
    $this->actingAs($user)->getJson(verificationPath($other))->assertForbidden();

    $expired = verificationPath($user);
    $this->travel(61)->minutes();
    $this->actingAs($user)->getJson($expired)->assertForbidden();

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

/* Password reset */

it('answers forgot-password the same way whether or not the email exists', function () {
    Notification::fake();
    $user = customer(['email' => 'rahim@example.com']);

    $known = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'Rahim@example.com'])->assertOk()->json('message');
    $unknown = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'nobody@example.com'])->assertOk()->json('message');

    expect($known)->toBe($unknown);
    Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
        return str_starts_with($notification->toMail($user)->actionUrl, 'http://localhost:3000/reset-password?token=');
    });
});

it('resets the password and signs out other sessions', function () {
    Notification::fake();
    $user = customer(['email' => 'rahim@example.com']);
    DB::table('sessions')->insert(['id' => 'old-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);

    $this->postJson('/api/v1/auth/forgot-password', ['email' => 'rahim@example.com']);
    $token = null;
    Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $n) use (&$token) {
        $token = $n->token;

        return true;
    });

    $this->postJson('/api/v1/auth/reset-password', [
        'token' => $token,
        'email' => 'rahim@example.com',
        'password' => 'newpass123',
        'password_confirmation' => 'newpass123',
    ])->assertOk();

    expect(DB::table('sessions')->where('user_id', $user->id)->exists())->toBeFalse();
    $this->postJson('/api/v1/auth/login', ['login' => 'rahim@example.com', 'password' => 'newpass123'])->assertOk();
});

it('rejects an invalid reset token', function () {
    customer(['email' => 'rahim@example.com']);

    $this->postJson('/api/v1/auth/reset-password', [
        'token' => 'not-a-real-token',
        'email' => 'rahim@example.com',
        'password' => 'newpass123',
        'password_confirmation' => 'newpass123',
    ])->assertUnprocessable()->assertJsonValidationErrors('email');
});
