<?php

namespace App\Http\Resources\Content;

use App\Models\Page;
use App\Services\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Editable page. Admin requests also get id, status and updated_at.
 *
 * @mixin Page
 */
class PageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $admin = $request->is('api/v1/admin/*');

        return [
            'id' => $this->when($admin, $this->id),
            'key' => $this->key,
            'title' => $this->title,
            'slug' => $this->slug,
            'status' => $this->when($admin, $this->status),
            'body' => $this->body,
            'hero_image' => $this->hero_image_path
                ? ['url' => MediaUrl::for($this->hero_image_path), 'alt' => $this->hero_image_alt ?? $this->title, 'path' => $this->when($admin, $this->hero_image_path)]
                : null,
            'meta' => [
                'title' => $this->meta_title ?: $this->title,
                'description' => $this->meta_description,
            ],
            'meta_title' => $this->when($admin, $this->meta_title),
            'meta_description' => $this->when($admin, $this->meta_description),
            'updated_at' => $this->updated_at,
        ];
    }
}
