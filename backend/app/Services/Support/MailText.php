<?php

namespace App\Services\Support;

/**
 * Text typed by visitors, made safe for Markdown emails. Blade's {{ }} escapes
 * HTML but not Markdown, so "[Verify](https://evil)" would become a real link
 * in an email sent from our domain, and "|" would break a table. Markdown
 * characters are backslash-escaped and line breaks flattened.
 */
final class MailText
{
    public static function escape(?string $text): string
    {
        if ($text === null) {
            return '';
        }

        $flat = preg_replace('/\s+/u', ' ', trim($text)) ?? '';

        // "<", ">" and "&" are left to Blade's HTML escaping (escaping them here
        // too would show "&lt;" literally).
        return preg_replace('/([\\\\`*_{}\[\]()#+\-!|~])/', '\\\\$1', $flat) ?? '';
    }
}
