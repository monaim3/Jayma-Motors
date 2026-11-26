<?php

use App\Enums\AppointmentSource;
use App\Enums\Role;
use App\Mail\CustomerAppointmentMail;
use App\Mail\WorkshopAppointmentAlert;
use App\Models\Appointment;
use App\Models\User;
use App\Services\Appointments\AppointmentService;
use App\Services\Support\MediaUrl;
use Carbon\CarbonImmutable;
use Database\Seeders\ContentSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Mail;

/*
| Security review fixes (2026-11-26): booking emails can't carry links,
| email-change and login limits, staff bookings and car owners, clean 401s,
| response headers and media paths.
*/

beforeEach(function () {
    $this->seed([RolesAndPermissionsSeeder::class, ContentSeeder::class]);
    $this->travelTo(CarbonImmutable::parse('2026-11-25 10:00:00', 'Asia/Dhaka'));
    Mail::fake();
});

function securityCustomer(string $phone): User
{
    $user = User::factory()->create(['phone' => $phone])->assignRole(Role::Customer->value);
    $user->customer()->create(['name' => $user->name, 'phone' => $user->phone, 'email' => $user->email]);

    return $user;
}

function securityBooking(array $overrides = []): array
{
    return [
        'contact_name' => 'Rahim Uddin',
        'contact_phone' => '01711949110',
        'contact_email' => 'rahim@example.com',
        'vehicle_brand' => 'Toyota',
        'vehicle_model' => 'Axio',
        'registration_number' => 'Dhaka Metro Ga 12-3456',
        'service' => 'engine-brake-servicing',
        'preferred_date' => '2026-11-27',
        ...$overrides,
    ];
}

/* Booking emails */

it('refuses web links in the name and car fields of a booking', function () {
    $this->actingAs(securityCustomer('+8801811111111'));

    foreach (['contact_name', 'vehicle_brand', 'vehicle_model', 'registration_number'] as $field) {
        $this->postJson('/api/v1/appointments', securityBooking([$field => 'Click https://evil.example now']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$field => 'web link']);
    }
    expect(Appointment::count())->toBe(0);
});

it('never turns Markdown typed by a customer into links or table cells in emails', function () {
    $appointment = new Appointment([
        'reference' => 'APT-2026-00042',
        'contact_name' => '[Verify your account](evil.example/login)',
        'contact_phone' => '+8801711949110',
        'vehicle_brand' => 'Toyota',
        'vehicle_model' => 'Axio | **bold**',
        'registration_number' => 'Dhaka Metro Ga 12-3456',
        'notes' => "Line one\n| injected | row |",
        'preferred_date' => '2026-11-27',
    ]);

    $customer = (new CustomerAppointmentMail($appointment, 'booked'))->render();
    $workshop = (new WorkshopAppointmentAlert($appointment, 'new'))->render();

    foreach ([$customer, $workshop] as $html) {
        expect($html)->not->toContain('href="evil.example/login"')
            ->and($html)->not->toContain('<strong>bold</strong>')
            ->and($html)->toContain('[Verify your account](evil.example/login)');
    }
    expect($workshop)->not->toContain('<td>injected</td>');
});

/* Email changes */

it('limits email changes to 3 an hour, so the form cannot flood an inbox', function () {
    $user = securityCustomer('+8801811111112');
    $this->actingAs($user);

    foreach (['a@example.com', 'b@example.com', 'c@example.com'] as $email) {
        $this->patchJson('/api/v1/me/profile', ['email' => $email])->assertOk();
    }
    $this->patchJson('/api/v1/me/profile', ['email' => 'victim@example.com'])->assertTooManyRequests();
    expect($user->fresh()->email)->toBe('c@example.com');

    // Changing only the name is not limited.
    $this->patchJson('/api/v1/me/profile', ['name' => 'New Name'])->assertOk();
});

/* Login */

it('limits login attempts per IP across many accounts', function () {
    foreach (range(1, 20) as $i) {
        $this->postJson('/api/v1/auth/login', ['login' => "nobody{$i}@example.com", 'password' => 'wrong-pass-1'])
            ->assertUnprocessable();
    }
    $this->postJson('/api/v1/auth/login', ['login' => 'nobody21@example.com', 'password' => 'wrong-pass-1'])
        ->assertTooManyRequests();
});

/* Staff bookings and car owners */

it('links a staff booking to the car owner only when the contact phone is theirs', function () {
    $owner = securityCustomer('+8801811111113');
    $vehicle = $owner->customer->vehicles()->create([
        'brand_name' => 'Toyota',
        'model' => 'Axio',
        'registration_number' => 'Dhaka Metro Ga 11-1111',
        'registration_number_normalized' => 'DHAKAMETROGA111111',
    ]);
    $book = fn (string $phone, string $date) => app(AppointmentService::class)->book([
        ...securityBooking(['contact_phone' => $phone, 'preferred_date' => $date]),
        'vehicle_id' => $vehicle->id,
        'service_id' => null,
    ], null, AppointmentSource::Staff);

    expect($book('+8801811111113', '2026-11-27')->customer_id)->toBe($owner->customer->id)
        ->and($book('+8801999000000', '2026-11-28')->customer_id)->toBeNull();
});

/* API responses */

it('answers a signed-out request with 401 JSON, even without an Accept header', function () {
    $this->get('/api/v1/auth/me')->assertUnauthorized()->assertJson(['message' => 'Unauthenticated.']);
});

it('sends security headers and hides the PHP version', function () {
    $response = $this->get('https://localhost/api/v1/settings/public');

    $response->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        ->assertHeaderMissing('X-Powered-By');
});

it('never turns a "//host" media path into a link to another site', function () {
    expect(MediaUrl::for('//evil.example/x.jpg'))->toBeNull()
        ->and(MediaUrl::for('/\\evil.example/x.jpg'))->toBeNull()
        ->and(MediaUrl::for('/images/services/a.webp'))->toBe('/images/services/a.webp');
});
