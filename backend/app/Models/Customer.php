<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Customer profile (Step 4 §4.2): linked to a login (user_id) or a walk-in (user_id null).
 */
#[Fillable(['user_id', 'name', 'phone', 'email', 'address', 'notes', 'linked_at', 'created_by'])]
#[Hidden(['notes'])]
class Customer extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'linked_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Staff member who created a walk-in record. */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isWalkIn(): bool
    {
        return $this->user_id === null;
    }
}
