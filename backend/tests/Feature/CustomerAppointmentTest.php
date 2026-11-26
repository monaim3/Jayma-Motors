<?php

use App\Enums\AppointmentStatus;
use App\Enums\Role;
use App\Jobs\SendAppointmentEmail;
use App\Mail\CustomerAppointmentMail;
use App\Mail\WorkshopAppointmentAlert;
use App\Models\Appointment;
use App\Models\User;
use App\Services\Settings\SettingsService;
use Carbon\CarbonImmutable;
use Database\Seeders\ContentSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Mail;

/*
| B3 step 2 — My appointments (Step 7 §10) and booking emails (Step 7 §4).
| "Today" is Wednesday 2026-11-25 in Dhaka.
*/

beforeEach(function () {
    $this->seed([RolesAndPermissionsSeeder::class, ContentSeeder::class]);
    $this->travelTo(CarbonImmutable::parse('2026-11-25 10:00:00', 'Asia/Dhaka'));
    Mail::fake();
});

function customerUser(string $phone = '+8801911111111'): User
{
    $user = User::factory()->create(['phone' => $phone])->assignRole(Role::Customer->value);
    $user->customer()->create(['name' => $user->name, 'phone' => $user->phone, 'email' => $user->email]);

    return $user;
}

/**
 * Act as $user (or a guest) for the next request. The app instance lives for
 * the whole test, and auth guards remember the first user they resolve, so
 * forget them first — every real request starts fresh.
 */
function actAs(?User $user)
{
    app('auth')->forgetGuards();

    return $user ? test()->actingAs($user) : test();
}

/** Book as $user, or as another (new) customer when $user is null. Booking needs an account. */
function bookFor(?User $user, array $overrides = []): string
{
    static $others = 0;
    $request = actAs($user ?? customerUser(sprintf('+88019%08d', 50000000 + ++$others)));

    return $request->postJson('/api/v1/appointments', [
        'contact_name' => 'Rahim Uddin',
        'contact_phone' => '01711949110',
        'contact_email' => 'rahim@example.com',
        'vehicle_brand' => 'Toyota',
        'vehicle_model' => 'Axio',
        'registration_number' => 'Dhaka Metro Ga 12-3456',
        'service' => 'engine-brake-servicing',
        'preferred_date' => '2026-11-27',
        ...$overrides,
    ])->assertCreated()->json('data.reference');
}

/* Emails */

it('emails the customer and alerts the workshop when a booking is made', function () {
    bookFor(null);

    Mail::assertSent(CustomerAppointmentMail::class, fn ($mail) => $mail->hasTo('rahim@example.com')
        && $mail->kind === 'booked'
        && str_contains($mail->envelope()->subject, 'APT-2026-00001'));
    Mail::assertSent(WorkshopAppointmentAlert::class, fn ($mail) => $mail->hasTo('jaymamotors@gmail.com')
        && $mail->kind === 'new');
});

it('only alerts the workshop when the customer gave no email', function () {
    bookFor(null, ['contact_email' => '']);

    Mail::assertNotSent(CustomerAppointmentMail::class);
    Mail::assertSent(WorkshopAppointmentAlert::class);
});

it('sends the workshop alert to every notification email in Settings', function () {
    app(SettingsService::class)->update('notifications', ['recipient_emails' => ['a@jayma.test', 'b@jayma.test']], null);

    bookFor(null);

    Mail::assertSent(WorkshopAppointmentAlert::class, fn ($mail) => $mail->hasTo('a@jayma.test') && $mail->hasTo('b@jayma.test'));
});

it('renders both emails with the booking details', function () {
    bookFor(null);
    $appointment = Appointment::sole();

    $customer = (new CustomerAppointmentMail($appointment, 'booked'))->render();
    $workshop = (new WorkshopAppointmentAlert($appointment, 'new'))->render();

    expect($customer)->toContain('APT-2026-00001', 'Friday, 27 November 2026', 'Engine &amp; Brake Servicing', 'call you to confirm')
        ->and($workshop)->toContain('Rahim Uddin', '01711-949110', 'Dhaka Metro Ga 12-3456');
});

it('never lets a failing mail server break a booking', function () {
    Mail::shouldReceive('to')->andThrow(new RuntimeException('SMTP down'));

    (new SendAppointmentEmail('x@example.com', new CustomerAppointmentMail(new Appointment, 'booked')))->handle();

    expect(true)->toBeTrue(); // no exception escaped
});

/* My appointments */

it('lists only my own bookings, upcoming first by date', function () {
    $me = customerUser();
    bookFor($me, ['preferred_date' => '2026-12-05', 'registration_number' => 'B-2']);
    bookFor($me, ['preferred_date' => '2026-11-27']);
    bookFor(customerUser('+8801922222222'), ['contact_phone' => '01922222222']);
    bookFor(null, ['contact_phone' => '01933333333']);

    actAs($me)->getJson('/api/v1/me/appointments?filter[scope]=upcoming')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.preferred_date', '2026-11-27')
        ->assertJsonPath('data.1.preferred_date', '2026-12-05')
        ->assertJsonPath('data.0.can_cancel', true)
        ->assertJsonPath('data.0.service.name', 'Engine & Brake Servicing');
});

it('moves cancelled and past bookings to the past list', function () {
    $me = customerUser();
    $cancelled = bookFor($me, ['preferred_date' => '2026-12-01']);
    bookFor($me, ['preferred_date' => '2026-12-02', 'registration_number' => 'B-2']);
    Appointment::where('reference', $cancelled)->update(['status' => AppointmentStatus::Cancelled]);
    // A finished visit from earlier this month.
    Appointment::query()->create([
        ...Appointment::where('reference', $cancelled)->first()->only([
            'customer_id', 'contact_name', 'contact_phone', 'vehicle_brand', 'vehicle_model',
            'registration_number', 'registration_number_normalized', 'source',
        ]),
        'reference' => 'APT-2026-09999',
        'preferred_date' => '2026-11-01',
        'status' => AppointmentStatus::CheckedIn,
    ]);

    actAs($me)->getJson('/api/v1/me/appointments?filter[scope]=past')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.reference', $cancelled)
        ->assertJsonPath('data.1.reference', 'APT-2026-09999');
});

it('shows one booking with its status timeline', function () {
    $me = customerUser();
    $reference = bookFor($me);

    actAs($me)->getJson("/api/v1/me/appointments/{$reference}")
        ->assertOk()
        ->assertJsonPath('data.reference', $reference)
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.status_label', 'Pending')
        ->assertJsonPath('data.timeline.0.label', 'Booking received');
});

it('hides other people\'s bookings', function () {
    $other = bookFor(customerUser('+8801922222222'), ['contact_phone' => '01922222222']);

    actAs(customerUser())->getJson("/api/v1/me/appointments/{$other}")->assertNotFound();
    actAs(customerUser('+8801944444444'))->postJson("/api/v1/me/appointments/{$other}/cancel")->assertNotFound();
});

it('keeps staff and guests out of the customer portal', function () {
    $this->getJson('/api/v1/me/appointments')->assertUnauthorized();

    $staff = User::factory()->create(['phone' => null])->assignRole(Role::Manager->value);
    actAs($staff)->getJson('/api/v1/me/appointments')->assertForbidden();
});

/* Cancelling */

it('lets the customer cancel before the date and alerts the workshop', function () {
    $me = customerUser();
    $reference = bookFor($me);

    actAs($me)->postJson("/api/v1/me/appointments/{$reference}/cancel", ['reason' => 'Plans changed'])
        ->assertOk()
        ->assertJsonPath('data.status', 'cancelled')
        ->assertJsonPath('data.can_cancel', false)
        ->assertJsonPath('data.timeline.1.label', 'Cancelled');

    $appointment = Appointment::sole();
    expect($appointment->cancellation_reason)->toBe('Plans changed')
        ->and($appointment->cancelled_at)->not->toBeNull();

    Mail::assertSent(CustomerAppointmentMail::class, fn ($mail) => $mail->kind === 'cancelled');
    Mail::assertSent(WorkshopAppointmentAlert::class, fn ($mail) => $mail->kind === 'cancelled');
});

it('refuses to cancel on the day itself, or twice', function () {
    $me = customerUser();
    $today = bookFor($me, ['preferred_date' => '2026-11-25']);
    $later = bookFor($me, ['preferred_date' => '2026-11-30', 'registration_number' => 'B-2']);

    actAs($me)->postJson("/api/v1/me/appointments/{$today}/cancel")
        ->assertConflict()
        ->assertJsonPath('message', 'This booking can no longer be cancelled online. Please call us.');

    actAs($me)->postJson("/api/v1/me/appointments/{$later}/cancel")->assertOk();
    actAs($me)->postJson("/api/v1/me/appointments/{$later}/cancel")->assertConflict();
});
