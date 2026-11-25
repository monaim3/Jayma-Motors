<?php

use App\Enums\AppointmentStatus;
use App\Enums\Role;
use App\Mail\CustomerAppointmentMail;
use App\Mail\WorkshopAppointmentAlert;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\ContentSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;

/*
| B3 step 3 — bookings in the admin panel (Step 7 §11.2, Step 3 §6.2).
| "Today" is Wednesday 2026-11-25 in Dhaka.
*/

beforeEach(function () {
    $this->seed([RolesAndPermissionsSeeder::class, ContentSeeder::class]);
    $this->travelTo(CarbonImmutable::parse('2026-11-25 10:00:00', 'Asia/Dhaka'));
    Mail::fake();
});

function advisor(): User
{
    return User::factory()->create(['phone' => null])->assignRole(Role::ServiceAdvisor->value);
}

function staffAs(?User $user)
{
    app('auth')->forgetGuards();

    return $user ? test()->actingAs($user) : test();
}

function websiteBooking(array $overrides = []): Appointment
{
    staffAs(null)->postJson('/api/v1/appointments', [
        'contact_name' => 'Rahim Uddin',
        'contact_phone' => '01711949110',
        'contact_email' => 'rahim@example.com',
        'vehicle_brand' => 'Toyota',
        'vehicle_model' => 'Axio',
        'registration_number' => 'Dhaka Metro Ga 12-3456',
        'service' => 'engine-brake-servicing',
        'preferred_date' => '2026-11-27',
        ...$overrides,
    ])->assertCreated();

    return Appointment::latest('id')->first();
}

/* Access */

it('keeps customers and guests out of the bookings admin', function () {
    staffAs(null)->getJson('/api/v1/admin/appointments')->assertUnauthorized();

    $customer = User::factory()->create(['phone' => '+8801911111111'])->assignRole(Role::Customer->value);
    staffAs($customer)->getJson('/api/v1/admin/appointments')->assertForbidden();
});

/* Listing */

it('lists bookings by date with filters and search', function () {
    websiteBooking(['preferred_date' => '2026-12-03']);
    websiteBooking(['preferred_date' => '2026-11-26', 'contact_name' => 'Karim Mia', 'contact_phone' => '01822333444', 'registration_number' => 'Chatta Metro Ka 11-2222']);
    Appointment::where('contact_name', 'Karim Mia')->update(['status' => AppointmentStatus::Confirmed]);

    $staff = advisor();
    staffAs($staff)->getJson('/api/v1/admin/appointments')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.preferred_date', '2026-11-26')
        ->assertJsonPath('data.0.contact.phone_display', '01822-333444');

    staffAs($staff)->getJson('/api/v1/admin/appointments?filter[status]=pending')->assertJsonCount(1, 'data');
    staffAs($staff)->getJson('/api/v1/admin/appointments?filter[date_from]=2026-12-01')->assertJsonCount(1, 'data');
    staffAs($staff)->getJson('/api/v1/admin/appointments?filter[search]=karim')->assertJsonCount(1, 'data');
    staffAs($staff)->getJson('/api/v1/admin/appointments?filter[search]=01822-333')->assertJsonCount(1, 'data');
    staffAs($staff)->getJson('/api/v1/admin/appointments?filter[search]=chatta metro ka 11')->assertJsonCount(1, 'data');
    staffAs($staff)->getJson('/api/v1/admin/appointments?filter[search]=APT-2026-00001')->assertJsonCount(1, 'data');
    staffAs($staff)->getJson('/api/v1/admin/appointments?sort=-preferred_date')->assertJsonPath('data.0.preferred_date', '2026-12-03');
});

/* Staff bookings */

it('lets staff book for a phone customer and confirm it straight away', function () {
    $customer = Customer::create(['name' => 'Walk-in', 'phone' => '+8801733444555']);

    staffAs(advisor())->postJson('/api/v1/admin/appointments', [
        'contact_name' => 'Walk-in',
        'contact_phone' => '01733444555',
        'contact_email' => 'walkin@example.com',
        'vehicle_brand' => 'Honda',
        'vehicle_model' => 'Vezel',
        'registration_number' => 'Dhaka Metro Ga 55-5555',
        'service' => 'wheel-alignment',
        'preferred_date' => '2026-11-28',
        'confirm' => true,
        'time_note' => '11:00 AM',
        'customer_id' => $customer->id,
    ])
        ->assertCreated()
        ->assertJsonPath('data.status', 'confirmed')
        ->assertJsonPath('data.source', 'staff')
        ->assertJsonPath('data.time_note', '11:00 AM')
        ->assertJsonPath('data.customer.id', $customer->id);

    Mail::assertSent(CustomerAppointmentMail::class, fn ($mail) => $mail->kind === 'confirmed');
    Mail::assertNotSent(WorkshopAppointmentAlert::class);
});

/* Status changes */

it('confirms a pending booking with a time note and emails the customer', function () {
    $appointment = websiteBooking();

    staffAs(advisor())->postJson("/api/v1/admin/appointments/{$appointment->id}/confirm", ['time_note' => '10:30 AM'])
        ->assertOk()
        ->assertJsonPath('data.status', 'confirmed')
        ->assertJsonPath('data.time_note', '10:30 AM')
        ->assertJsonPath('data.actions.confirm', false)
        ->assertJsonPath('data.timeline.1.event', 'appointment.confirmed');

    Mail::assertSent(CustomerAppointmentMail::class, fn ($mail) => $mail->kind === 'confirmed');
    staffAs(advisor())->postJson("/api/v1/admin/appointments/{$appointment->id}/confirm")->assertConflict();
});

it('reschedules with a reason and checks the new date', function () {
    $appointment = websiteBooking();
    $staff = advisor();

    staffAs($staff)->postJson("/api/v1/admin/appointments/{$appointment->id}/reschedule", ['preferred_date' => '2026-12-01'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['reason']);
    staffAs($staff)->postJson("/api/v1/admin/appointments/{$appointment->id}/reschedule", ['preferred_date' => '2026-11-20', 'reason' => 'x'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['preferred_date']);

    staffAs($staff)->postJson("/api/v1/admin/appointments/{$appointment->id}/reschedule", [
        'preferred_date' => '2026-12-01',
        'reason' => 'Lift under repair',
    ])
        ->assertOk()
        ->assertJsonPath('data.preferred_date', '2026-12-01')
        ->assertJsonPath('data.status', 'pending');

    $log = AuditLog::where('event', 'appointment.rescheduled')->sole();
    expect($log->old_values['preferred_date'])->toBe('2026-11-27')
        ->and($log->new_values['preferred_date'])->toBe('2026-12-01')
        ->and($log->note)->toBe('Lift under repair')
        ->and($log->user_id)->toBe($staff->id);
    Mail::assertSent(CustomerAppointmentMail::class, fn ($mail) => $mail->kind === 'rescheduled');
});

it('requires a reason to cancel and emails the customer', function () {
    $appointment = websiteBooking();

    staffAs(advisor())->postJson("/api/v1/admin/appointments/{$appointment->id}/cancel")->assertUnprocessable();
    staffAs(advisor())->postJson("/api/v1/admin/appointments/{$appointment->id}/cancel", ['reason' => 'Customer called'])
        ->assertOk()
        ->assertJsonPath('data.status', 'cancelled')
        ->assertJsonPath('data.cancellation_reason', 'Customer called');

    Mail::assertSent(CustomerAppointmentMail::class, fn ($mail) => $mail->kind === 'cancelled');
    // Staff cancelled it: no alert back to the workshop.
    Mail::assertNotSent(WorkshopAppointmentAlert::class, fn ($mail) => $mail->kind === 'cancelled');
});

it('checks in or marks no-show only from the appointment day', function () {
    $today = websiteBooking(['preferred_date' => '2026-11-25']);
    $later = websiteBooking(['preferred_date' => '2026-11-30', 'registration_number' => 'B-2']);
    $staff = advisor();

    // Must be confirmed first.
    staffAs($staff)->postJson("/api/v1/admin/appointments/{$today->id}/check-in")->assertConflict();
    staffAs($staff)->postJson("/api/v1/admin/appointments/{$today->id}/confirm")->assertOk();
    staffAs($staff)->postJson("/api/v1/admin/appointments/{$later->id}/confirm")->assertOk();

    staffAs($staff)->postJson("/api/v1/admin/appointments/{$later->id}/check-in")->assertConflict();
    staffAs($staff)->postJson("/api/v1/admin/appointments/{$later->id}/no-show")->assertConflict();

    staffAs($staff)->postJson("/api/v1/admin/appointments/{$today->id}/check-in")
        ->assertOk()
        ->assertJsonPath('data.status', 'checked_in');

    $this->travelTo(CarbonImmutable::parse('2026-12-01 09:00:00', 'Asia/Dhaka'));
    staffAs($staff)->postJson("/api/v1/admin/appointments/{$later->id}/no-show")
        ->assertOk()
        ->assertJsonPath('data.status', 'no_show');
});

it('updates the time note, notes and linked customer with an audit entry', function () {
    $appointment = websiteBooking();
    $customer = Customer::create(['name' => 'Rahim Uddin', 'phone' => '+8801711949110']);

    staffAs(advisor())->patchJson("/api/v1/admin/appointments/{$appointment->id}", [
        'time_note' => '2:00 PM',
        'customer_id' => $customer->id,
    ])
        ->assertOk()
        ->assertJsonPath('data.time_note', '2:00 PM')
        ->assertJsonPath('data.customer.name', 'Rahim Uddin');

    expect(AuditLog::where('event', 'appointment.updated')->sole()->new_values)
        ->toMatchArray(['time_note' => '2:00 PM', 'customer_id' => (string) $customer->id]);
});

/* Nightly expiry */

it('expires pending bookings whose date has passed', function () {
    $pending = websiteBooking(['preferred_date' => '2026-11-26']);
    $confirmed = websiteBooking(['preferred_date' => '2026-11-26', 'registration_number' => 'B-2']);
    $future = websiteBooking(['preferred_date' => '2026-12-05', 'registration_number' => 'B-3']);
    staffAs(advisor())->postJson("/api/v1/admin/appointments/{$confirmed->id}/confirm")->assertOk();

    $this->travelTo(CarbonImmutable::parse('2026-11-27 00:30:00', 'Asia/Dhaka'));
    Artisan::call('appointments:expire-pending');

    expect($pending->fresh()->status)->toBe(AppointmentStatus::Expired)
        ->and($confirmed->fresh()->status)->toBe(AppointmentStatus::Confirmed)
        ->and($future->fresh()->status)->toBe(AppointmentStatus::Pending)
        ->and(AuditLog::where('event', 'appointment.expired')->count())->toBe(1);
});
