<?php

namespace App\Http\Requests\Admin\Settings;

use App\Services\Settings\SettingsSchema;
use Illuminate\Foundation\Http\FormRequest;

/**
 * PATCH /admin/settings/{group} — rules come from SettingsSchema; send only the keys to change.
 */
class UpdateSettingsRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return SettingsSchema::rules($this->route('group'));
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'phones.*.number' => 'phone number',
            'phones.*.label' => 'phone label',
            'opening_hours.*.days' => 'days',
            'opening_hours.*.time' => 'hours',
            'closed_weekdays.*' => 'weekday',
            'recipient_emails.*' => 'email address',
        ];
    }
}
