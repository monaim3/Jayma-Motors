<?php

namespace App\Services\Content;

use App\Models\SlugRedirect;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * URL slugs (Step 3 §10, C9): generated from the title, unique per table
 * (soft-deleted rows included, so an old URL is never reused by mistake), and
 * old URLs of published items keep redirecting.
 */
class SlugService
{
    /**
     * A unique slug for $model's table, based on $source ("Engine & Brake" → "engine-brake").
     */
    public function unique(Model $model, string $source, int $maxLength = 140): string
    {
        $base = Str::limit(Str::slug($source), $maxLength - 4, '') ?: 'item';
        $slug = $base;
        $n = 2;

        while ($this->taken($model, $slug)) {
            $slug = "{$base}-{$n}";
            $n++;
        }

        return $slug;
    }

    /**
     * Keep an old public path working after a slug change. Chains are collapsed:
     * every earlier path now points straight at the newest one.
     */
    public function redirect(string $oldPath, string $newPath): void
    {
        if ($oldPath === $newPath) {
            return;
        }

        SlugRedirect::where('new_path', $oldPath)->update(['new_path' => $newPath]);
        // The new path is live again, so it must not redirect anywhere.
        SlugRedirect::where('old_path', $newPath)->delete();
        SlugRedirect::updateOrCreate(['old_path' => $oldPath], ['new_path' => $newPath]);
    }

    private function taken(Model $model, string $slug): bool
    {
        $query = $model->newQuery()->where('slug', $slug);

        if (in_array(SoftDeletes::class, class_uses_recursive($model), true)) {
            $query->withTrashed();
        }

        if ($model->exists) {
            $query->whereKeyNot($model->getKey());
        }

        return $query->exists();
    }
}
