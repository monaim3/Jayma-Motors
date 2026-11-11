<?php

namespace App\Services\Settings;

use App\Services\Support\PhoneNumber;
use Closure;

/**
 * Every site setting (Step 3 §11, Step 4 §12.1): group → key → default, rules.
 *
 * Defaults are the details confirmed by the owner so far (2026-11). Public
 * groups are returned by GET /settings/public; the rest are admin-only.
 * Phone values are stored normalised (+8801XXXXXXXXX).
 */
final class SettingsSchema
{
    /** Groups the public website may read. */
    public const PUBLIC_GROUPS = ['business', 'social', 'seo', 'quick_buttons'];

    /**
     * @return array<string, array<string, array{default: mixed, rules: array<int|string, mixed>, phone?: 'one'|'list'}>>
     */
    public static function definition(): array
    {
        $phone = self::phoneRule();

        return [
            'business' => [
                'name' => ['default' => 'Jayma Motors', 'rules' => ['required', 'string', 'max:100']],
                'address' => [
                    'default' => '441-442, Evercare Hospital Road (beside Khanas/Khudos), Vatara, Dhaka, Bangladesh',
                    'rules' => ['required', 'string', 'max:255'],
                ],
                'phones' => [
                    'default' => [
                        ['label' => 'Main', 'number' => '+8801711949110'],
                        ['label' => 'Hotline', 'number' => '+8801347544000'],
                    ],
                    'rules' => [
                        '' => ['required', 'array', 'min:1', 'max:5'],
                        '*.label' => ['required', 'string', 'max:30'],
                        '*.number' => ['required', 'string', $phone],
                    ],
                    'phone' => 'list',
                ],
                'email' => ['default' => 'jaymamotors@gmail.com', 'rules' => ['required', 'email:rfc', 'max:191']],
                'whatsapp' => ['default' => '+8801711949110', 'rules' => ['required', 'string', $phone], 'phone' => 'one'],
                'google_maps_url' => [
                    'default' => 'https://www.google.com/maps/place/?q=place_id:ChIJEbiRprPHVTcRY_mnWjW2_BA',
                    'rules' => ['nullable', 'url:https', 'max:500'],
                ],
                'opening_hours' => [
                    'default' => [['days' => 'Every day', 'time' => '9:00 AM – 9:00 PM']],
                    'rules' => [
                        '' => ['present', 'array', 'max:7'],
                        '*.days' => ['required', 'string', 'max:60'],
                        '*.time' => ['required', 'string', 'max:60'],
                    ],
                ],
            ],
            'social' => [
                'facebook' => ['default' => 'https://www.facebook.com/jaymamotors', 'rules' => ['nullable', 'url:https', 'max:255']],
                'instagram' => ['default' => null, 'rules' => ['nullable', 'url:https', 'max:255']],
                'youtube' => ['default' => null, 'rules' => ['nullable', 'url:https', 'max:255']],
                'linkedin' => ['default' => null, 'rules' => ['nullable', 'url:https', 'max:255']],
            ],
            'appointments' => [
                'booking_window_days' => ['default' => 60, 'rules' => ['required', 'integer', 'min:1', 'max:365']],
                // 0 = Sunday … 6 = Saturday. Empty: open every day (owner, 2026-11).
                'closed_weekdays' => [
                    'default' => [],
                    'rules' => ['' => ['present', 'array', 'max:6'], '*' => ['integer', 'between:0,6', 'distinct']],
                ],
                'daily_limit' => ['default' => null, 'rules' => ['nullable', 'integer', 'min:1', 'max:500']],
            ],
            'notifications' => [
                'recipient_emails' => [
                    'default' => ['jaymamotors@gmail.com'],
                    'rules' => ['' => ['required', 'array', 'min:1', 'max:5'], '*' => ['email:rfc', 'max:191', 'distinct']],
                ],
            ],
            'seo' => [
                'default_title' => [
                    'default' => 'Jayma Motors — Car Service & Repair in Dhaka',
                    'rules' => ['required', 'string', 'max:70'],
                ],
                'default_description' => [
                    'default' => 'Multi-brand car service and repair workshop in Vatara, Dhaka since 2008. Computerized diagnosis, engine & brake service, denting, painting and authorized Shell Helix lubricants.',
                    'rules' => ['required', 'string', 'max:200'],
                ],
                'share_image' => ['default' => null, 'rules' => ['nullable', 'string', 'max:255']],
            ],
            'quick_buttons' => [
                // "Emergency Service" and "Pick & Drop" targets (D8).
                'emergency_phone' => ['default' => '+8801711949110', 'rules' => ['required', 'string', $phone], 'phone' => 'one'],
                'pick_drop_whatsapp' => ['default' => '+8801711949110', 'rules' => ['required', 'string', $phone], 'phone' => 'one'],
            ],
        ];
    }

    /** @return list<string> */
    public static function groups(): array
    {
        return array_keys(self::definition());
    }

    public static function hasGroup(string $group): bool
    {
        return array_key_exists($group, self::definition());
    }

    /**
     * Validation rules for a PATCH to one group: every key is optional ("sometimes"),
     * but a key that is sent must be valid.
     *
     * @return array<string, mixed>
     */
    public static function rules(string $group): array
    {
        $rules = [];

        foreach (self::definition()[$group] as $key => $spec) {
            $keyRules = $spec['rules'];

            if (array_is_list($keyRules)) {
                $rules[$key] = ['sometimes', ...$keyRules];

                continue;
            }

            foreach ($keyRules as $suffix => $suffixRules) {
                $rules[$suffix === '' ? $key : "{$key}.{$suffix}"] = $suffix === '' ? ['sometimes', ...$suffixRules] : $suffixRules;
            }
        }

        return $rules;
    }

    /**
     * Store phone numbers in one format.
     */
    public static function normalize(string $group, string $key, mixed $value): mixed
    {
        return match (self::definition()[$group][$key]['phone'] ?? null) {
            'one' => PhoneNumber::normalize($value) ?? $value,
            'list' => array_map(
                fn (array $row) => ['label' => $row['label'], 'number' => PhoneNumber::normalize($row['number']) ?? $row['number']],
                $value,
            ),
            default => $value,
        };
    }

    private static function phoneRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) {
            if (! PhoneNumber::isValid(is_string($value) ? $value : null)) {
                $fail('Enter a valid Bangladeshi mobile number, e.g. 01711-949110.');
            }
        };
    }
}
