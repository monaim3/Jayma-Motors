<?php

use App\Enums\AppointmentStatus;
use App\Enums\Role;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Holiday;
use App\Models\Service;
use App\Models\User;
use App\Services\Settings\SettingsService;
use Carbon\CarbonImmutable;
use Database\Seeders\ContentSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;

/*
| B3 step 1 — public booking and availability (Step 3 §6.1, Step 7 §9).
| "Today" is fixed: Wednesday 2026-11-25 in Dhaka.
*/

beforeEach(function () {
    $this->seed([RolesAndPermissionsSeeder::class, ContentSeeder::class]);
    $this->travelTo(CarbonImmutable::parse('2026-11-25 10:00:00', 'Asia/Dhaka'));
});

function booking(array $overrides = []): array
{
    return [
        'contact_name' => 'Rahim Uddin',
        'contact_phone' => '01711-949110',
        'contact_email' => 'Rahim@Example.com',
        'vehicle_brand' => 'Toyota',
        'vehicle_model' => 'Axio',
        'registration_number' => 'Dhaka Metro Ga 12-3456',
        'service' => 'engine-brake-servicing',
        'preferred_date' => '2026-11-27',
        'website' => '',
        ...$overrides,
    ];
}

/* Booking */

it('books a guest appointment and returns its reference', function () {
    $this->postJson('/api/v1/appointments', booking())
        ->assertCreated()
        ->assertJsonPath('data.reference', 'APT-2026-00001')
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.preferred_date', '2026-11-27');

    $appointment = Appointment::sole();
    expect($appointment->contact_phone)->toBe('+8801711949110')
        ->and($appointment->contact_email)->toBe('rahim@example.com')
        ->and($appointment->registration_number_normalized)->toBe('DHAKAMETROGA123456')
        ->and($appointment->service->slug)->toBe('engine-brake-servicing')
        ->and($appointment->customer_id)->toBeNull()
        ->and($appointment->source->value)->toBe('website')
        ->and(AuditLog::where('event', 'appointment.booked')->count())->toBe(1);
});

it('numbers bookings one after another', function () {
    $this->postJson('/api/v1/appointments', booking())->assertCreated();
    $this->postJson('/api/v1/appointments', booking(['registration_number' => 'Dhaka Metro Kha 11-1111']))
        ->assertCreated()
        ->assertJsonPath('data.reference', 'APT-2026-00002');
});

it('accepts the service id instead of the slug', function () {
    $service = Service::where('slug', 'wheel-alignment')->sole();

    $this->postJson('/api/v1/appointments', booking(['service' => null, 'service_id' => $service->id]))
        ->assertCreated();

    expect(Appointment::sole()->service_id)->toBe($service->id);
});

it('links a logged-in customer booking to their customer profile', function () {
    $user = User::factory()->create(['phone' => '+8801911111111'])->assignRole(Role::Customer->value);
    $customer = $user->customer()->create(['name' => $user->name, 'phone' => $user->phone, 'email' => $user->email]);

    $this->actingAs($user)->postJson('/api/v1/appointments', booking())->assertCreated();

    expect(Appointment::sole()->customer_id)->toBe($customer->id);
});

it('rejects a duplicate booking for the same car, phone and day', function () {
    $this->postJson('/api/v1/appointments', booking())->assertCreated();

    // Same car written differently, same phone in another format.
    $this->postJson('/api/v1/appointments', booking([
        'registration_number' => 'dhaka metro ga 123456',
        'contact_phone' => '+8801711949110',
    ]))
        ->assertConflict()
        ->assertJsonPath('message', 'You already have a booking for this date.');
});

it('allows the same car again once the earlier booking is cancelled', function () {
    $this->postJson('/api/v1/appointments', booking())->assertCreated();
    Appointment::query()->update(['status' => AppointmentStatus::Cancelled]);

    $this->postJson('/api/v1/appointments', booking())->assertCreated();
});

it('validates the required fields and the phone number', function () {
    $this->postJson('/api/v1/appointments', booking([
        'contact_name' => '',
        'contact_phone' => '12345',
        'vehicle_model' => '',
        'registration_number' => '',
        'service' => '',
        'preferred_date' => '',
    ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'contact_name', 'contact_phone', 'vehicle_model', 'registration_number', 'service', 'preferred_date',
        ]);
});

it('refuses a service that is not bookable or not published', function () {
    Service::where('slug', 'engine-brake-servicing')->update(['is_bookable' => false]);

    $this->postJson('/api/v1/appointments', booking())
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['service']);
});

it('refuses bookings when the spam trap is filled', function () {
    $this->postJson('/api/v1/appointments', booking(['website' => 'http://spam.example']))
        ->assertUnprocessable();

    expect(Appointment::count())->toBe(0);
});

/* Date rules */

it('refuses past dates and dates beyond the booking window', function () {
    $this->postJson('/api/v1/appointments', booking(['preferred_date' => '2026-11-24']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['preferred_date' => 'today or a later date']);

    // Window is 60 days: 2027-01-24 is the last bookable day.
    $this->postJson('/api/v1/appointments', booking(['preferred_date' => '2027-01-24']))->assertCreated();
    $this->postJson('/api/v1/appointments', booking(['preferred_date' => '2027-01-25']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['preferred_date' => 'Bookings open up to 24 January 2027']);
});

it('accepts today', function () {
    $this->postJson('/api/v1/appointments', booking(['preferred_date' => '2026-11-25']))->assertCreated();
});

it('refuses closed weekdays and holidays', function () {
    app(SettingsService::class)->update('appointments', ['closed_weekdays' => [5]], null); // Friday
    Holiday::create(['date' => '2026-12-16', 'name' => 'Victory Day']);

    $this->postJson('/api/v1/appointments', booking(['preferred_date' => '2026-11-27'])) // Friday
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['preferred_date' => 'closed on this day']);
    $this->postJson('/api/v1/appointments', booking(['preferred_date' => '2026-12-16']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['preferred_date' => 'closed on this day']);
});

it('refuses a day that has reached the daily limit', function () {
    app(SettingsService::class)->update('appointments', ['daily_limit' => 2], null);

    $this->postJson('/api/v1/appointments', booking(['registration_number' => 'A-1']))->assertCreated();
    $this->postJson('/api/v1/appointments', booking(['registration_number' => 'A-2']))->assertCreated();
    $this->postJson('/api/v1/appointments', booking(['registration_number' => 'A-3']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['preferred_date' => 'fully booked']);
});

/* Availability */

it('lists the booking window, closed days and full days', function () {
    app(SettingsService::class)->update('appointments', ['closed_weekdays' => [5], 'daily_limit' => 1], null);
    Holiday::create(['date' => '2026-12-16', 'name' => 'Victory Day']);
    $this->postJson('/api/v1/appointments', booking(['preferred_date' => '2026-11-28']))->assertCreated();

    $this->getJson('/api/v1/appointments/availability?from=2026-11-25&to=2026-12-20')
        ->assertOk()
        ->assertJsonPath('data.today', '2026-11-25')
        ->assertJsonPath('data.max_date', '2027-01-24')
        ->assertJsonPath('data.closed_dates', [
            '2026-11-27', '2026-12-04', '2026-12-11', '2026-12-16', '2026-12-18',
        ])
        ->assertJsonPath('data.full_dates', ['2026-11-28']);
});

it('keeps availability inside the booking window', function () {
    $data = $this->getJson('/api/v1/appointments/availability?from=2026-01-01&to=2028-01-01')
        ->assertOk()
        ->json('data');

    expect($data['closed_dates'])->toBe([])->and($data['max_date'])->toBe('2027-01-24');
});

/* Services */

it('stops a booked service from being deleted', function () {
    $this->postJson('/api/v1/appointments', booking())->assertCreated();

    expect(Service::where('slug', 'engine-brake-servicing')->sole()->isInUse())->toBeTrue()
        ->and(Service::where('slug', 'wheel-alignment')->sole()->isInUse())->toBeFalse();
});
