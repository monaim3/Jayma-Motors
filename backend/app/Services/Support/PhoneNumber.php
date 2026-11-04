<?php

namespace App\Services\Support;

/**
 * Bangladeshi mobile numbers (Step 3 §3).
 *
 * Accepts 01XXXXXXXXX, 8801XXXXXXXXX or +8801XXXXXXXXX (spaces and dashes
 * ignored) and stores them as +8801XXXXXXXXX.
 */
final class PhoneNumber
{
    private const NORMALIZED_PATTERN = '/^\+8801[3-9]\d{8}$/';

    /**
     * Returns the normalised number, or null when the input is not a valid BD mobile number.
     */
    public static function normalize(?string $input): ?string
    {
        if ($input === null) {
            return null;
        }

        $digits = preg_replace('/[\s\-().]/', '', trim($input));

        if (str_starts_with($digits, '+')) {
            $digits = substr($digits, 1);
        }

        if (str_starts_with($digits, '01')) {
            $digits = '88'.$digits;
        }

        $normalized = '+'.$digits;

        return preg_match(self::NORMALIZED_PATTERN, $normalized) === 1 ? $normalized : null;
    }

    public static function isValid(?string $input): bool
    {
        return self::normalize($input) !== null;
    }

    /**
     * Display format used on the website, e.g. 01711-949110.
     */
    public static function display(string $normalized): string
    {
        $local = '0'.substr($normalized, 4);

        return substr($local, 0, 5).'-'.substr($local, 5);
    }
}
