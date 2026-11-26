<?php

namespace App\Services\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Public URL for a stored image path.
 *
 * - "/images/…"     a file shipped with the frontend (seeded content) → returned as-is
 * - "https://…"     already absolute → as-is
 * - "services/x.webp" an upload on the public disk → APP_URL/storage/services/x.webp
 */
final class MediaUrl
{
    public static function for(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        // "//host/x" is another site, not a path on ours.
        if (str_starts_with($path, '//') || str_starts_with($path, '/\\')) {
            return null;
        }

        if (str_starts_with($path, '/') || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }
}
