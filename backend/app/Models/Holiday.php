<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * A specific date the workshop is closed (Step 4 §12.2); bookings on it are refused (B3).
 */
#[Fillable(['date', 'name'])]
class Holiday extends Model
{
    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
        ];
    }
}
