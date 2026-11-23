<?php

use App\Enums\Role;
use App\Events\PublicContentChanged;
use App\Models\Page;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\ContentSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Event;

/*
| B2b — Services, pages and slug redirects (Step 7 §9, §11.8; Step 3 §10).
*/

beforeEach(function () {
    $this->seed([RolesAndPermissionsSeeder::class, ContentSeeder::class]);
});

function contentEditor(Role $role = Role::Manager): User
{
    return User::factory()->create(['phone' => null])->assignRole($role->value);
}

function newService(array $overrides = []): array
{
    return [
        'name' => 'AC Repair & Gas Refill',
        'status' => 'published',
        'short_description' => 'Cold air again in Dhaka heat.',
        'icon' => 'Snowflake',
        'duration' => '2–4 hours',
        'included' => ['Leak test', 'Gas refill', ''],
        'faqs' => [['q' => 'How long does gas last?', 'a' => 'Years, if there is no leak.']],
        'image_path' => 'services/ac.webp',
        'image_alt' => 'Technician checking AC pressure',
        ...$overrides,
    ];
}

/* Seed */

it('seeds the 8 services and 3 pages as the website shows them', function () {
    expect(Service::count())->toBe(8)
        ->and(Page::pluck('key')->sort()->values()->all())->toBe(['about', 'privacy', 'terms']);

    $brakes = Service::where('slug', 'engine-brake-servicing')->sole();
    expect($brakes->icon)->toBe('Cog')
        ->and($brakes->included)->not->toBeEmpty()
        ->and($brakes->faqs[0])->toHaveKeys(['q', 'a'])
        ->and($brakes->image_path)->toBe('/images/services/real/engine-brake-servicing.webp');

    // Running it again changes nothing.
    $this->seed(ContentSeeder::class);
    expect(Service::count())->toBe(8);
});

/* Public */

it('lists published services in display order, with a bookable filter', function () {
    Service::where('slug', 'battery-replacement')->update(['status' => 'draft']);
    Service::where('slug', 'wheel-alignment')->update(['is_bookable' => false]);

    $this->getJson('/api/v1/services')
        ->assertOk()
        ->assertJsonCount(7, 'data')
        ->assertJsonPath('data.0.slug', 'engine-brake-servicing')
        ->assertJsonPath('data.0.image.url', '/images/services/real/engine-brake-servicing.webp')
        ->assertJsonMissingPath('data.0.faqs');

    $this->getJson('/api/v1/services?filter[bookable]=1')->assertJsonCount(6, 'data');
});

it('shows a published service with its page content and 3 related services', function () {
    $this->getJson('/api/v1/services/denting')
        ->assertOk()
        ->assertJsonPath('data.name', 'Denting & Body Repair')
        ->assertJsonStructure(['data' => ['headline', 'description', 'included', 'signs', 'faqs', 'meta' => ['title', 'description'], 'related']])
        ->assertJsonCount(3, 'data.related');
});

it('hides draft and unknown services', function () {
    Service::where('slug', 'denting')->update(['status' => 'draft']);

    $this->getJson('/api/v1/services/denting')->assertNotFound();
    $this->getJson('/api/v1/services/no-such-service')->assertNotFound();
});

it('serves published pages by key', function () {
    $this->getJson('/api/v1/pages/terms')
        ->assertOk()
        ->assertJsonPath('data.title', 'Terms & Conditions')
        ->assertJsonMissingPath('data.status');

    expect($this->getJson('/api/v1/pages/terms')->json('data.body'))->toContain('<h2>Bookings and appointments</h2>');

    Page::where('key', 'privacy')->update(['status' => 'draft']);
    $this->getJson('/api/v1/pages/privacy')->assertNotFound();
});

/* Admin: access */

it('lets only staff with content.manage edit content', function () {
    $this->getJson('/api/v1/admin/services')->assertUnauthorized();

    $customer = User::factory()->create()->assignRole(Role::Customer->value);
    $this->actingAs($customer)->getJson('/api/v1/admin/services')->assertForbidden();
    $this->actingAs(contentEditor(Role::ServiceAdvisor))->getJson('/api/v1/admin/services')->assertForbidden();

    $this->actingAs(contentEditor())->getJson('/api/v1/admin/services')->assertOk()->assertJsonCount(8, 'data');
});

/* Admin: services */

it('creates a service with a generated slug, cleaned lists and a website refresh', function () {
    Event::fake([PublicContentChanged::class]);

    $this->actingAs(contentEditor())->postJson('/api/v1/admin/services', newService())
        ->assertCreated()
        ->assertJsonPath('data.slug', 'ac-repair-gas-refill')
        ->assertJsonPath('data.included', ['Leak test', 'Gas refill'])
        ->assertJsonPath('data.sort_order', 9)
        ->assertJsonPath('data.image_url', 'http://localhost:8000/storage/services/ac.webp');

    $this->getJson('/api/v1/services/ac-repair-gas-refill')->assertOk();
    Event::assertDispatched(PublicContentChanged::class, fn ($e) => in_array('services', $e->tags, true));
});

it('makes the slug unique when the name is already used', function () {
    $this->actingAs(contentEditor())->postJson('/api/v1/admin/services', newService(['name' => 'Denting']))
        ->assertCreated()
        ->assertJsonPath('data.slug', 'denting-2');
});

it('removes unsafe HTML from the description', function () {
    $this->actingAs(contentEditor())->postJson('/api/v1/admin/services', newService([
        'description' => '<h2>Why</h2><p onclick="steal()">Cold <strong>air</strong></p><script>alert(1)</script><a href="javascript:alert(1)">x</a>',
    ]))->assertCreated();

    $html = Service::where('slug', 'ac-repair-gas-refill')->value('description');
    expect($html)->toContain('<h2>Why</h2>')
        ->toContain('<strong>air</strong>')
        ->not->toContain('script')
        ->not->toContain('onclick')
        ->not->toContain('javascript:');
});

it('validates service input', function (array $overrides, string $field) {
    $this->actingAs(contentEditor())
        ->postJson('/api/v1/admin/services', newService($overrides))
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'no name' => [['name' => ''], 'name'],
    'bad slug' => [['slug' => 'Engine Repair!'], 'slug'],
    'taken slug' => [['slug' => 'denting'], 'slug'],
    'unknown icon' => [['icon' => 'Rocket'], 'icon'],
    'image without alt' => [['image_alt' => null], 'image_alt'],
    'faq without answer' => [['faqs' => [['q' => 'Why?']]], 'faqs.0.a'],
    'bad status' => [['status' => 'live'], 'status'],
]);

it('keeps the old URL working when a published service is renamed', function () {
    $editor = contentEditor();
    $id = Service::where('slug', 'denting')->value('id');

    $this->actingAs($editor)->patchJson("/api/v1/admin/services/{$id}", ['slug' => 'dent-repair'])->assertOk();
    $this->actingAs($editor)->patchJson("/api/v1/admin/services/{$id}", ['slug' => 'dent-and-body-repair'])->assertOk();

    // Both old URLs point straight at the newest one (chains collapsed).
    $this->getJson('/api/v1/redirects?path=/services/denting')->assertOk()->assertJsonPath('data.new_path', '/services/dent-and-body-repair');
    $this->getJson('/api/v1/redirects?path=/services/dent-repair')->assertOk()->assertJsonPath('data.new_path', '/services/dent-and-body-repair');
    $this->getJson('/api/v1/redirects?path=/services/dent-and-body-repair')->assertNotFound();
});

it('does not create redirects for a draft that changes slug', function () {
    $id = Service::where('slug', 'denting')->value('id');
    Service::whereKey($id)->update(['status' => 'draft']);

    $this->actingAs(contentEditor())->patchJson("/api/v1/admin/services/{$id}", ['slug' => 'dent-repair'])->assertOk();

    $this->getJson('/api/v1/redirects?path=/services/denting')->assertNotFound();
});

it('updates only the fields sent', function () {
    $service = Service::where('slug', 'denting')->sole();

    $this->actingAs(contentEditor())->patchJson("/api/v1/admin/services/{$service->id}", ['duration' => 'Usually 2 days'])
        ->assertOk()
        ->assertJsonPath('data.duration', 'Usually 2 days')
        ->assertJsonPath('data.name', 'Denting & Body Repair')
        ->assertJsonPath('data.faqs', $service->faqs);
});

it('reorders and soft-deletes services', function () {
    $editor = contentEditor();
    $ids = Service::ordered()->pluck('id')->reverse()->values()->all();

    $this->actingAs($editor)->postJson('/api/v1/admin/services/reorder', ['ids' => $ids])->assertNoContent();
    $this->getJson('/api/v1/services')->assertJsonPath('data.0.slug', 'battery-replacement');

    $this->actingAs($editor)->deleteJson("/api/v1/admin/services/{$ids[0]}")->assertNoContent();
    expect(Service::count())->toBe(7)->and(Service::withTrashed()->count())->toBe(8);
    $this->getJson('/api/v1/services/battery-replacement')->assertNotFound();
});

/* Admin: pages */

it('edits a page (cleaned HTML) but never creates or deletes one', function () {
    $editor = contentEditor();
    $page = Page::where('key', 'terms')->sole();

    $this->actingAs($editor)->getJson('/api/v1/admin/pages')->assertOk()->assertJsonCount(3, 'data');

    $this->actingAs($editor)->patchJson("/api/v1/admin/pages/{$page->id}", [
        'body' => '<h2>New</h2><p style="color:red">Updated <script>x</script>terms</p>',
    ])->assertOk()->assertJsonPath('data.status', 'published');

    expect($page->fresh()->body)->toBe('<h2>New</h2><p>Updated terms</p>');

    $this->actingAs($editor)->postJson('/api/v1/admin/pages', ['key' => 'x'])->assertMethodNotAllowed();
    $this->actingAs($editor)->deleteJson("/api/v1/admin/pages/{$page->id}")->assertMethodNotAllowed();
});

it('redirects a published page whose URL changes', function () {
    $page = Page::where('key', 'about')->sole();

    $this->actingAs(contentEditor())->patchJson("/api/v1/admin/pages/{$page->id}", ['slug' => 'about-us'])->assertOk();

    $this->getJson('/api/v1/redirects?path=about')->assertOk()->assertJsonPath('data.new_path', '/about-us');
});
