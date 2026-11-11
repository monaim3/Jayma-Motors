<?php

namespace App\Services\Settings;

use App\Events\PublicContentChanged;
use App\Models\Setting;
use App\Models\User;
use App\Services\Support\AuditLogger;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Site settings (Step 7 §3): defaults from SettingsSchema overlaid with saved
 * values, cached until the next change. Changes are audited (Step 3 §14).
 */
class SettingsService
{
    private const CACHE_KEY = 'settings.all';

    public function __construct(private readonly AuditLogger $audit) {}

    /**
     * Every group with every key (saved value, or the default).
     *
     * @return array<string, array<string, mixed>>
     */
    public function all(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            $saved = Setting::query()->get(['group', 'key', 'value'])
                ->groupBy('group')
                ->map(fn ($rows) => $rows->pluck('value', 'key'));

            $all = [];
            foreach (SettingsSchema::definition() as $group => $keys) {
                foreach ($keys as $key => $spec) {
                    $all[$group][$key] = $saved->has($group) && $saved[$group]->has($key)
                        ? $saved[$group][$key]
                        : $spec['default'];
                }
            }

            return $all;
        });
    }

    /**
     * One value by "group.key", e.g. get('appointments.booking_window_days').
     */
    public function get(string $path, mixed $default = null): mixed
    {
        return Arr::get($this->all(), $path, $default);
    }

    /**
     * What the public website may see.
     *
     * @return array<string, array<string, mixed>>
     */
    public function publicSettings(): array
    {
        return Arr::only($this->all(), SettingsSchema::PUBLIC_GROUPS);
    }

    /**
     * Save validated values for one group; only keys that actually change are
     * written and audited.
     *
     * @param  array<string, mixed>  $values
     * @return array<string, mixed> the group after the update
     */
    public function update(string $group, array $values, ?User $by): array
    {
        $current = $this->all()[$group];
        $changed = [];

        DB::transaction(function () use ($group, $values, $by, $current, &$changed) {
            foreach ($values as $key => $value) {
                if (! array_key_exists($key, $current)) {
                    continue;
                }

                $value = SettingsSchema::normalize($group, $key, $value);

                if ($value === $current[$key]) {
                    continue;
                }

                $setting = Setting::updateOrCreate(
                    ['group' => $group, 'key' => $key],
                    ['value' => $value, 'updated_by' => $by?->id],
                );

                $this->audit->log('settings.updated', $setting, [$key => $current[$key]], [$key => $value], "{$group}.{$key}");
                $changed[] = $key;
            }
        });

        if ($changed !== []) {
            Cache::forget(self::CACHE_KEY);

            if (in_array($group, SettingsSchema::PUBLIC_GROUPS, true)) {
                PublicContentChanged::dispatch(['settings']);
            }
        }

        return $this->all()[$group];
    }

    public function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
