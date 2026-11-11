<?php

use App\Enums\Role;
use App\Events\PublicContentChanged;
use App\Models\AuditLog;
use App\Models\Holiday;
use App\Models\User;
use App\Services\Settings\SettingsService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Event;

/*
| B2a — Settings & holidays (Step 7 §9, §11.9; Step 3 §11).
*/

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function staffMember(Role $role): User
{
    return User::factory()->create(['phone' => null])->assignRole($role->value);
}

/* Public */

it('returns the public settings with the confirmed defaults', function () {
    $this->getJson('/api/v1/settings/public')
        ->assertOk()
        ->assertJsonPath('data.business.name', 'Jayma Motors')
        ->assertJsonPath('data.business.phones.0.number', '+8801711949110')
        ->assertJsonPath('data.business.phones.1.label', 'Hotline')
        ->assertJsonPath('data.business.opening_hours.0.days', 'Every day')
        ->assertJsonPath('data.social.facebook', 'https://www.facebook.com/jaymamotors')
        ->assertJsonStructure(['data' => ['business', 'social', 'seo', 'quick_buttons']]);
});

it('keeps admin-only groups out of the public settings', function () {
    $data = $this->getJson('/api/v1/settings/public')->json('data');

    expect($data)->not->toHaveKeys(['appointments', 'notifications']);
});

/* Access */

it('lets only staff with settings.manage use the admin settings', function () {
    $this->getJson('/api/v1/admin/settings')->assertUnauthorized();

    $customer = User::factory()->create()->assignRole(Role::Customer->value);
    $this->actingAs($customer)->getJson('/api/v1/admin/settings')->assertForbidden();

    $advisor = staffMember(Role::ServiceAdvisor);
    $this->actingAs($advisor)->getJson('/api/v1/admin/settings')->assertForbidden();

    $manager = staffMember(Role::Manager);
    $this->actingAs($manager)->getJson('/api/v1/admin/settings')
        ->assertOk()
        ->assertJsonPath('data.appointments.booking_window_days', 60)
        ->assertJsonPath('data.notifications.recipient_emails', ['jaymamotors@gmail.com']);
});

/* Updates */

it('updates only the keys sent, normalises phones, audits and refreshes the cache', function () {
    Event::fake([PublicContentChanged::class]);
    $manager = staffMember(Role::Manager);

    // Warm the cache first, so the test proves it is cleared.
    app(SettingsService::class)->all();

    $this->actingAs($manager)->patchJson('/api/v1/admin/settings/business', [
        'phones' => [['label' => 'Main', 'number' => '01711-949110'], ['label' => 'Hotline', 'number' => '01347 544000']],
        'opening_hours' => [['days' => 'Saturday – Thursday', 'time' => '9:00 AM – 9:00 PM']],
    ])->assertOk()
        ->assertJsonPath('data.phones.1.number', '+8801347544000')
        ->assertJsonPath('data.name', 'Jayma Motors');

    $this->getJson('/api/v1/settings/public')
        ->assertJsonPath('data.business.opening_hours.0.days', 'Saturday – Thursday');

    // Phones are unchanged after normalising, so only opening_hours is audited.
    expect(AuditLog::where('event', 'settings.updated')->pluck('note')->all())->toBe(['business.opening_hours']);
    Event::assertDispatched(PublicContentChanged::class, fn ($event) => $event->tags === ['settings']);
});

it('does not refresh the website for admin-only groups', function () {
    Event::fake([PublicContentChanged::class]);

    $this->actingAs(staffMember(Role::SuperAdmin))
        ->patchJson('/api/v1/admin/settings/appointments', ['booking_window_days' => 30, 'closed_weekdays' => [5]])
        ->assertOk()
        ->assertJsonPath('data.booking_window_days', 30)
        ->assertJsonPath('data.closed_weekdays', [5]);

    Event::assertNotDispatched(PublicContentChanged::class);
});

it('validates settings per group', function (string $group, array $payload, string $field) {
    $this->actingAs(staffMember(Role::Manager))
        ->patchJson("/api/v1/admin/settings/{$group}", $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'bad phone' => ['business', ['phones' => [['label' => 'Main', 'number' => '12345']]], 'phones.0.number'],
    'no phones' => ['business', ['phones' => []], 'phones'],
    'bad email' => ['business', ['email' => 'not-an-email'], 'email'],
    'http social link' => ['social', ['facebook' => 'http://facebook.com/x'], 'facebook'],
    'window too long' => ['appointments', ['booking_window_days' => 400], 'booking_window_days'],
    'weekday out of range' => ['appointments', ['closed_weekdays' => [7]], 'closed_weekdays.0'],
    'no alert email' => ['notifications', ['recipient_emails' => []], 'recipient_emails'],
    'long seo title' => ['seo', ['default_title' => str_repeat('a', 71)], 'default_title'],
    'bad quick button' => ['quick_buttons', ['emergency_phone' => '999'], 'emergency_phone'],
]);

it('returns 404 for an unknown settings group', function () {
    $this->actingAs(staffMember(Role::Manager))
        ->patchJson('/api/v1/admin/settings/secrets', ['x' => 1])
        ->assertNotFound();
});

/* Holidays */

it('adds, lists and deletes holidays, with an audit trail', function () {
    $manager = staffMember(Role::Manager);

    $id = $this->actingAs($manager)->postJson('/api/v1/admin/holidays', ['date' => '2026-12-16', 'name' => 'Victory Day'])
        ->assertCreated()
        ->assertJsonPath('data.date', '2026-12-16')
        ->json('data.id');

    $this->actingAs($manager)->getJson('/api/v1/admin/holidays')
        ->assertOk()
        ->assertJsonPath('data.0.date', '2026-12-16')
        ->assertJsonPath('data.0.name', 'Victory Day');

    $this->actingAs($manager)->deleteJson("/api/v1/admin/holidays/{$id}")->assertNoContent();

    expect(Holiday::count())->toBe(0)
        ->and(AuditLog::whereIn('event', ['holiday.created', 'holiday.deleted'])->count())->toBe(2);
});

it('rejects a duplicate or invalid holiday date', function () {
    $manager = staffMember(Role::Manager);
    Holiday::create(['date' => '2026-12-16', 'name' => 'Victory Day']);

    $this->actingAs($manager)->postJson('/api/v1/admin/holidays', ['date' => '2026-12-16', 'name' => 'Again'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.date.0', 'This date is already marked as a holiday.');

    $this->actingAs($manager)->postJson('/api/v1/admin/holidays', ['date' => '16/12/2026', 'name' => 'Wrong format'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('date');
});

it('hides past holidays when asked for upcoming only', function () {
    $this->travelTo('2026-11-11 10:00:00');
    Holiday::create(['date' => '2026-03-26', 'name' => 'Independence Day']);
    Holiday::create(['date' => '2026-12-16', 'name' => 'Victory Day']);

    $this->actingAs(staffMember(Role::Manager))
        ->getJson('/api/v1/admin/holidays?filter[upcoming]=1')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Victory Day');
});
