<?php

namespace App\Services\Content;

use App\Events\PublicContentChanged;
use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Mews\Purifier\Facades\Purifier;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

/**
 * Admin changes to the services catalogue (Step 3 §10). Every change tells the
 * website to refresh (PublicContentChanged).
 */
class ServiceCatalog
{
    public function __construct(private readonly SlugService $slugs) {}

    /**
     * @param  array<string, mixed>  $data  validated
     */
    public function create(array $data): Service
    {
        $service = new Service;
        $data['slug'] = $data['slug'] ?? $this->slugs->unique($service, $data['name']);
        $data['sort_order'] ??= (int) Service::max('sort_order') + 1;

        $service->fill($this->clean($data))->save();

        PublicContentChanged::dispatch(['services', "service:{$service->slug}"]);

        return $service;
    }

    /**
     * @param  array<string, mixed>  $data  validated (only the fields sent)
     */
    public function update(Service $service, array $data): Service
    {
        $oldSlug = $service->slug;
        $wasPublished = $service->isPublished();

        if (array_key_exists('slug', $data) && $data['slug'] === null) {
            $data['slug'] = $this->slugs->unique($service, $data['name'] ?? $service->name);
        }

        DB::transaction(function () use ($service, $data, $oldSlug, $wasPublished) {
            $service->fill($this->clean($data))->save();

            // A published page that moves keeps its old URL working (C9).
            if ($wasPublished && $service->slug !== $oldSlug) {
                $this->slugs->redirect("/services/{$oldSlug}", "/services/{$service->slug}");
            }
        });

        PublicContentChanged::dispatch(array_values(array_unique(['services', "service:{$oldSlug}", "service:{$service->slug}"])));

        return $service;
    }

    /**
     * Soft delete. A service used by bookings or service records can only be unpublished → 409.
     */
    public function delete(Service $service): void
    {
        if ($service->isInUse()) {
            throw new ConflictHttpException('This service is used by bookings or service records. Unpublish it instead.');
        }

        $service->delete();

        PublicContentChanged::dispatch(['services', "service:{$service->slug}"]);
    }

    /**
     * @param  list<int>  $ids  service ids in the new display order; others keep their place after them
     */
    public function reorder(array $ids): void
    {
        DB::transaction(function () use ($ids) {
            foreach (array_values($ids) as $position => $id) {
                Service::whereKey($id)->update(['sort_order' => $position + 1]);
            }
        });

        PublicContentChanged::dispatch(['services']);
    }

    /**
     * Rich text is sanitised on the way in; list fields drop empty rows.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function clean(array $data): array
    {
        if (array_key_exists('description', $data) && $data['description'] !== null) {
            $data['description'] = Purifier::clean($data['description'], 'content') ?: null;
        }

        foreach (['included', 'signs'] as $list) {
            if (isset($data[$list])) {
                $data[$list] = array_values(array_filter(array_map(fn ($item) => trim((string) $item), $data[$list])));
            }
        }

        return $data;
    }
}
