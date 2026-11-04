<?php

namespace App\Services\Support;

/**
 * Vehicle registration numbers are kept as entered for display, plus a
 * normalised copy (upper-case, no spaces or dashes) for duplicate checks
 * and search (Step 3 §3).
 */
final class RegistrationNumber
{
    public static function normalize(string $input): string
    {
        return mb_strtoupper(preg_replace('/[\s\-_.\/]/u', '', trim($input)));
    }

    public static function clean(string $input): string
    {
        return preg_replace('/\s+/u', ' ', trim($input));
    }
}
