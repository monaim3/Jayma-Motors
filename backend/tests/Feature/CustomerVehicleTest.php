<?php

use App\Enums\Role;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use App\Models\VehicleOwnership;
use Carbon\CarbonImmutable;
use Database\Seeders\ContentSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Database\Seeders\VehicleBrandSeeder;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

/*
| B4 step 1 — my vehicles, profile and password (Step 7 §10, Step 3 §4.5, §5).
*/

beforeEach(function () {
    $this->seed([RolesAndPermissionsSeeder::class, ContentSeeder::class, VehicleBrandSeeder::class]);
    $this->travelTo(CarbonImmutable::parse('2026-11-25 10:00:00', 'Asia/Dhaka'));
    Mail::fake();
});

function vehicleOwner(string $phone = '+8801911111111', string $email = 'owner@example.com'): User
{
    $user = User::factory()->create(['phone' => $phone, 'email' => $email, 'password' => 'Old-pass-2026!'])
        ->assignRole(Role::Customer->value);
    $user->customer()->create(['name' => $user->name, 'phone' => $user->phone, 'email' => $user->email]);

    return $user;
}

function signedIn(?User $user)
{
    app('auth')->forgetGuards();

    return $user ? test()->actingAs($user) : test();
}

function axio(array $overrides = []): array
{
    return [
        'vehicle_brand_id' => VehicleBrand::where('name', 'Toyota')->value('id'),
        'model' => 'Axio',
        'year' => 2018,
        'registration_number' => 'Dhaka Metro Ga 12-3456',
        'color' => 'White',
        'fuel_type' => 'hybrid',
        ...$overrides,
    ];
}

/* Vehicle brands */

it('lists the active vehicle brands in order', function () {
    VehicleBrand::where('name', 'Subaru')->update(['is_active' => false]);

    $names = signedIn(null)->getJson('/api/v1/vehicle-brands')->assertOk()->json('data.*.name');

    expect($names[0])->toBe('Toyota')->and($names)->not->toContain('Subaru');
});

/* My vehicles */

it('adds a car with its first ownership period', function () {
    $user = vehicleOwner();

    signedIn($user)->postJson('/api/v1/me/vehicles', axio())
        ->assertCreated()
        ->assertJsonPath('data.brand_name', 'Toyota')
        ->assertJsonPath('data.registration_number', 'Dhaka Metro Ga 12-3456')
        ->assertJsonPath('data.fuel_type', 'hybrid');

    $vehicle = Vehicle::sole();
    expect($vehicle->registration_number_normalized)->toBe('DHAKAMETROGA123456')
        ->and($vehicle->customer_id)->toBe($user->customer->id)
        ->and(VehicleOwnership::where('vehicle_id', $vehicle->id)->whereNull('ended_at')->value('customer_id'))->toBe($user->customer->id)
        ->and(AuditLog::where('event', 'vehicle.created')->count())->toBe(1);
});

it('accepts a brand that is not in the list as free text', function () {
    signedIn(vehicleOwner())->postJson('/api/v1/me/vehicles', axio(['vehicle_brand_id' => null, 'brand_name' => 'Haval']))
        ->assertCreated()
        ->assertJsonPath('data.brand_name', 'Haval')
        ->assertJsonPath('data.vehicle_brand_id', null);
});

it('links a typed brand name to the list when it matches', function () {
    signedIn(vehicleOwner())->postJson('/api/v1/me/vehicles', axio(['vehicle_brand_id' => null, 'brand_name' => 'Proton']))
        ->assertCreated()
        ->assertJsonPath('data.vehicle_brand_id', VehicleBrand::where('name', 'Proton')->value('id'));
});

it('refuses a car that is already registered, however it is written', function () {
    signedIn(vehicleOwner())->postJson('/api/v1/me/vehicles', axio())->assertCreated();

    signedIn(vehicleOwner('+8801922222222', 'other@example.com'))
        ->postJson('/api/v1/me/vehicles', axio(['registration_number' => 'dhaka metro ga 123456']))
        ->assertConflict()
        ->assertJsonPath('message', 'This vehicle is already registered. Please contact Jayma Motors.');
});

it('validates the vehicle fields', function () {
    signedIn(vehicleOwner())->postJson('/api/v1/me/vehicles', ['vehicle_brand_id' => null, 'year' => 1900])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['brand_name', 'model', 'registration_number', 'year']);
});

it('lists, edits and removes only my own cars', function () {
    $me = vehicleOwner();
    $other = vehicleOwner('+8801922222222', 'other@example.com');
    $mine = signedIn($me)->postJson('/api/v1/me/vehicles', axio())->json('data.id');
    $theirs = signedIn($other)->postJson('/api/v1/me/vehicles', axio(['registration_number' => 'Dhaka Metro Kha 11-1111']))->json('data.id');

    signedIn($me)->getJson('/api/v1/me/vehicles')->assertOk()->assertJsonCount(1, 'data');
    signedIn($me)->patchJson("/api/v1/me/vehicles/{$mine}", ['color' => 'Silver'])->assertOk()->assertJsonPath('data.color', 'Silver');
    signedIn($me)->patchJson("/api/v1/me/vehicles/{$theirs}", ['color' => 'Red'])->assertNotFound();
    signedIn($me)->deleteJson("/api/v1/me/vehicles/{$theirs}")->assertNotFound();
});

it('re-checks the number when it is changed', function () {
    $me = vehicleOwner();
    signedIn($me)->postJson('/api/v1/me/vehicles', axio())->assertCreated();
    $second = signedIn($me)->postJson('/api/v1/me/vehicles', axio(['registration_number' => 'Dhaka Metro Kha 11-1111']))->json('data.id');

    signedIn($me)->patchJson("/api/v1/me/vehicles/{$second}", ['registration_number' => 'DHAKA METRO GA 12 3456'])->assertConflict();
});

it('deletes a car without history but archives one with bookings', function () {
    $me = vehicleOwner();
    $plain = signedIn($me)->postJson('/api/v1/me/vehicles', axio(['registration_number' => 'A-1111']))->json('data.id');
    $booked = signedIn($me)->postJson('/api/v1/me/vehicles', axio(['registration_number' => 'B-2222']))->json('data.id');
    signedIn($me)->postJson('/api/v1/appointments', [
        'contact_name' => 'Owner', 'contact_phone' => '01911111111', 'vehicle_id' => $booked,
        'service' => 'engine-brake-servicing', 'preferred_date' => '2026-11-27',
    ])->assertCreated();

    signedIn($me)->deleteJson("/api/v1/me/vehicles/{$plain}")->assertNoContent();
    signedIn($me)->deleteJson("/api/v1/me/vehicles/{$booked}")->assertNoContent();

    expect(Vehicle::find($plain))->toBeNull()
        ->and(Vehicle::find($booked)->archived_at)->not->toBeNull();
    signedIn($me)->getJson('/api/v1/me/vehicles')->assertJsonCount(0, 'data');
});

/* Booking with cars */

it('books with a saved car and copies its details', function () {
    $me = vehicleOwner();
    $car = signedIn($me)->postJson('/api/v1/me/vehicles', axio())->json('data.id');

    signedIn($me)->postJson('/api/v1/appointments', [
        'contact_name' => 'Owner', 'contact_phone' => '01911111111', 'vehicle_id' => $car,
        'service' => 'engine-brake-servicing', 'preferred_date' => '2026-11-27',
    ])->assertCreated();

    $appointment = Appointment::sole();
    expect($appointment->vehicle_id)->toBe($car)
        ->and($appointment->vehicle_brand)->toBe('Toyota')
        ->and($appointment->registration_number)->toBe('Dhaka Metro Ga 12-3456');
});

it('refuses someone else\'s car', function () {
    $car = signedIn(vehicleOwner('+8801922222222', 'other@example.com'))->postJson('/api/v1/me/vehicles', axio())->json('data.id');

    signedIn(vehicleOwner())->postJson('/api/v1/appointments', [
        'contact_name' => 'Owner', 'contact_phone' => '01911111111', 'vehicle_id' => $car,
        'service' => 'engine-brake-servicing', 'preferred_date' => '2026-11-27',
    ])->assertUnprocessable()->assertJsonValidationErrors(['vehicle_id']);
});

it('saves a new car typed into the booking form to my account', function () {
    $me = vehicleOwner();

    signedIn($me)->postJson('/api/v1/appointments', [
        'contact_name' => 'Owner', 'contact_phone' => '01911111111',
        'vehicle_brand' => 'Honda', 'vehicle_model' => 'Vezel', 'registration_number' => 'Dhaka Metro Ga 77-7777',
        'service' => 'wheel-alignment', 'preferred_date' => '2026-11-27',
    ])->assertCreated();

    $vehicle = Vehicle::sole();
    expect($vehicle->customer_id)->toBe($me->customer->id)
        ->and($vehicle->vehicle_brand_id)->toBe(VehicleBrand::where('name', 'Honda')->value('id'))
        ->and(Appointment::sole()->vehicle_id)->toBe($vehicle->id);
});

it('never attaches a guest booking or someone else\'s number to an account', function () {
    signedIn(vehicleOwner('+8801922222222', 'other@example.com'))->postJson('/api/v1/me/vehicles', axio())->assertCreated();

    signedIn(vehicleOwner())->postJson('/api/v1/appointments', [
        'contact_name' => 'Owner', 'contact_phone' => '01911111111',
        'vehicle_brand' => 'Toyota', 'vehicle_model' => 'Axio', 'registration_number' => 'Dhaka Metro Ga 12-3456',
        'service' => 'wheel-alignment', 'preferred_date' => '2026-11-27',
    ])->assertCreated();

    expect(Vehicle::count())->toBe(1)->and(Appointment::sole()->vehicle_id)->toBeNull();
});

/* Profile & password */

it('shows and updates my name; a new email must be verified again', function () {
    Notification::fake();
    $me = vehicleOwner();
    $me->forceFill(['email_verified_at' => now()])->save();

    signedIn($me)->getJson('/api/v1/me/profile')
        ->assertOk()
        ->assertJsonPath('data.phone_display', '01911-111111')
        ->assertJsonPath('data.email_verified', true);

    signedIn($me)->patchJson('/api/v1/me/profile', ['name' => 'Rahim Uddin', 'email' => 'New@Example.com'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Rahim Uddin')
        ->assertJsonPath('data.email', 'new@example.com')
        ->assertJsonPath('data.email_verified', false);

    expect($me->customer->fresh()->only(['name', 'email']))->toBe(['name' => 'Rahim Uddin', 'email' => 'new@example.com']);
    Notification::assertSentTo($me, VerifyEmail::class);
});

it('refuses an email another account uses', function () {
    vehicleOwner('+8801922222222', 'taken@example.com');

    signedIn(vehicleOwner())->patchJson('/api/v1/me/profile', ['email' => 'taken@example.com'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

it('changes the password only with the current one', function () {
    $me = vehicleOwner();

    signedIn($me)->putJson('/api/v1/me/password', [
        'current_password' => 'wrong', 'password' => 'New-pass-2026!', 'password_confirmation' => 'New-pass-2026!',
    ])->assertUnprocessable()->assertJsonValidationErrors(['current_password']);

    signedIn($me)->putJson('/api/v1/me/password', [
        'current_password' => 'Old-pass-2026!', 'password' => 'New-pass-2026!', 'password_confirmation' => 'New-pass-2026!',
    ])->assertOk();

    expect(Hash::check('New-pass-2026!', $me->fresh()->password))->toBeTrue();
});
