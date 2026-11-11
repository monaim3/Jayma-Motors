<?php

use App\Enums\Role;
use App\Jobs\RevalidateFrontend;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\ContentSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

/*
| Website refresh after admin changes (Step 7 §5).
*/

beforeEach(function () {
    $this->seed([RolesAndPermissionsSeeder::class, ContentSeeder::class]);
    config(['app.revalidate_secret' => 'test-secret', 'app.frontend_url' => 'http://frontend.test']);
});

it('asks the website to refresh the changed service after an admin edit', function () {
    Http::fake(['frontend.test/*' => Http::response(['ok' => true])]);
    $manager = User::factory()->create(['phone' => null])->assignRole(Role::Manager->value);
    $id = Service::where('slug', 'denting')->value('id');

    $this->actingAs($manager)->patchJson("/api/v1/admin/services/{$id}", ['duration' => '2 days'])->assertOk();

    Http::assertSent(fn (Request $request) => $request->url() === 'http://frontend.test/api/revalidate'
        && $request->header('X-Revalidate-Secret') === ['test-secret']
        && $request['tags'] === ['services', 'service:denting']);
});

it('refreshes settings when a public settings group changes', function () {
    Http::fake(['frontend.test/*' => Http::response(['ok' => true])]);
    $manager = User::factory()->create(['phone' => null])->assignRole(Role::Manager->value);

    $this->actingAs($manager)->patchJson('/api/v1/admin/settings/business', ['email' => 'info@jaymamotors.com'])->assertOk();

    Http::assertSent(fn (Request $request) => $request['tags'] === ['settings']);
});

it('does not fail the admin save when the website is down', function () {
    Http::fake(['frontend.test/*' => Http::response('down', 503)]);

    (new RevalidateFrontend(['services']))->handle();

    Http::assertSentCount(1);
});

it('skips the call when no secret is configured', function () {
    Http::fake();
    config(['app.revalidate_secret' => null]);

    (new RevalidateFrontend(['services']))->handle();

    Http::assertNothingSent();
});
