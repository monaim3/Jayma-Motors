<?php

use App\Enums\Permission;
use App\Enums\Role;
use App\Models\User;
use App\Models\VehicleBrand;
use App\Services\Support\ReferenceNumberGenerator;
use Database\Seeders\DatabaseSeeder;

it('responds on the versioned health endpoint', function () {
    $this->getJson('/api/v1/health')
        ->assertOk()
        ->assertJsonPath('status', 'ok');
});

it('returns JSON for unknown API routes', function () {
    $this->get('/api/v1/does-not-exist')
        ->assertNotFound()
        ->assertJsonStructure(['message']);
});

it('allows the frontend origin with credentials (CORS)', function () {
    $this->withHeaders([
        'Origin' => 'http://localhost:3000',
        'Access-Control-Request-Method' => 'POST',
    ])->options('/api/v1/health')
        ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
        ->assertHeader('Access-Control-Allow-Credentials', 'true');
});

it('does not allow other origins (CORS)', function () {
    $response = $this->withHeaders([
        'Origin' => 'https://evil.example',
        'Access-Control-Request-Method' => 'POST',
    ])->options('/api/v1/health');

    // The browser blocks the request because the allowed origin does not match.
    expect($response->headers->get('Access-Control-Allow-Origin'))->not->toBe('https://evil.example');
});

it('issues the Sanctum CSRF cookie', function () {
    $this->get('/sanctum/csrf-cookie')
        ->assertNoContent()
        ->assertCookie('XSRF-TOKEN');
});

describe('seeders', function () {
    beforeEach(function () {
        config()->set('app.super_admin', [
            'name' => 'Owner',
            'email' => 'Owner@Example.com',
            'password' => 'Secret123',
        ]);

        $this->seed(DatabaseSeeder::class);
    });

    it('creates the super admin with every permission', function () {
        $admin = User::where('email', 'owner@example.com')->firstOrFail();

        expect($admin->hasRole(Role::SuperAdmin->value))->toBeTrue()
            ->and($admin->isStaff())->toBeTrue()
            ->and($admin->hasVerifiedEmail())->toBeTrue();

        foreach (Permission::cases() as $permission) {
            expect($admin->can($permission->value))->toBeTrue();
        }
    });

    it('gives each staff role only its approved permissions', function () {
        $advisor = User::factory()->create()->assignRole(Role::ServiceAdvisor->value);
        $manager = User::factory()->create()->assignRole(Role::Manager->value);

        expect($advisor->can('service-records.manage'))->toBeTrue()
            ->and($advisor->can('service-records.edit-completed'))->toBeFalse()
            ->and($advisor->can('content.manage'))->toBeFalse()
            ->and($manager->can('service-records.edit-completed'))->toBeTrue()
            ->and($manager->can('users.manage'))->toBeFalse();
    });

    it('gives customers no admin permissions', function () {
        $customer = User::factory()->create()->assignRole(Role::Customer->value);

        expect($customer->isStaff())->toBeFalse()
            ->and($customer->getAllPermissions())->toBeEmpty();
    });

    it('seeds the approved vehicle brands with Other last', function () {
        expect(VehicleBrand::count())->toBe(20)
            ->and(VehicleBrand::ordered()->get()->last()->name)->toBe('Other');
    });

    it('can run again without duplicating data', function () {
        $this->seed(DatabaseSeeder::class);

        expect(User::count())->toBe(1)
            ->and(VehicleBrand::count())->toBe(20);
    });
});

it('generates sequential reference numbers per prefix and year', function () {
    $generator = app(ReferenceNumberGenerator::class);
    $year = now(config('app.business_timezone'))->format('Y');

    expect($generator->next('APT'))->toBe("APT-{$year}-00001")
        ->and($generator->next('APT'))->toBe("APT-{$year}-00002")
        ->and($generator->next('SR'))->toBe("SR-{$year}-00001");
});
