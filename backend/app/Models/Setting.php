<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * One site setting (Step 4 §12.1). Read and write through SettingsService,
 * which caches them and knows each key's default and validation.
 */
#[Fillable(['group', 'key', 'value', 'updated_by'])]
class Setting extends Model
{
    protected function casts(): array
    {
        return [
            'value' => 'json',
        ];
    }
}
