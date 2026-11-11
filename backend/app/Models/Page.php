<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Editable static page with a fixed system key (Step 4 §11.5). Seeded; admins
 * edit but never create or delete pages. Keys: about, terms, privacy
 * (why-us and shell-helix were dropped by the owner, 2026-11-09).
 */
#[Fillable(['key', 'title', 'slug', 'body', 'hero_image_path', 'hero_image_alt', 'status', 'meta_title', 'meta_description'])]
class Page extends Model
{
    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
        ];
    }
}
