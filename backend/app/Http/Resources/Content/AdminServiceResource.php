<?php

namespace App\Http\Resources\Content;

use App\Models\Service;
use App\Services\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Service as the admin editor sees it: every field, drafts included.
 *
 * @mixin Service
 */
class AdminServiceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'status' => $this->status,
            'is_bookable' => $this->is_bookable,
            'sort_order' => $this->sort_order,
            'short_description' => $this->short_description,
            'headline' => $this->headline,
            'description' => $this->description,
            'icon' => $this->icon,
            'duration' => $this->duration,
            'included' => $this->included ?? [],
            'signs' => $this->signs ?? [],
            'faqs' => $this->faqs ?? [],
            'image_path' => $this->image_path,
            'image_url' => MediaUrl::for($this->image_path),
            'image_alt' => $this->image_alt,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
