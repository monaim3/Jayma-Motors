<?php

namespace App\Http\Resources\Content;

use App\Models\Service;
use App\Services\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public service (Step 7 §9). List items are short; the detail view
 * (detailed()) adds the page content, SEO and related services.
 *
 * @mixin Service
 */
class ServiceResource extends JsonResource
{
    private bool $detailed = false;

    public function detailed(): static
    {
        $this->detailed = true;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $summary = [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'icon' => $this->icon,
            'duration' => $this->duration,
            'is_bookable' => $this->is_bookable,
            'image' => $this->image_path ? ['url' => MediaUrl::for($this->image_path), 'alt' => $this->image_alt ?? $this->name] : null,
        ];

        if (! $this->detailed) {
            return $summary;
        }

        return [
            ...$summary,
            'headline' => $this->headline,
            'description' => $this->description,
            'included' => $this->included ?? [],
            'signs' => $this->signs ?? [],
            'faqs' => $this->faqs ?? [],
            'meta' => [
                'title' => $this->meta_title ?: $this->name,
                'description' => $this->meta_description ?: $this->short_description,
            ],
            // Set by the controller with setRelation('related', …).
            'related' => $this->whenLoaded('related', fn () => ServiceResource::collection($this->related)),
        ];
    }
}
