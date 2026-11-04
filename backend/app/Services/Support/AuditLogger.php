<?php

namespace App\Services\Support;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * Writes append-only audit entries (Step 3 §14).
 */
final class AuditLogger
{
    public function __construct(private readonly Request $request) {}

    /**
     * @param  array<string, mixed>|null  $old
     * @param  array<string, mixed>|null  $new
     */
    public function log(string $event, Model $model, ?array $old = null, ?array $new = null, ?string $note = null): AuditLog
    {
        return AuditLog::create([
            'user_id' => $this->request->user()?->id,
            'event' => $event,
            'auditable_type' => $model->getMorphClass(),
            'auditable_id' => $model->getKey(),
            'old_values' => $old,
            'new_values' => $new,
            'note' => $note,
            'ip_address' => $this->request->ip(),
            'user_agent' => substr((string) $this->request->userAgent(), 0, 255) ?: null,
        ]);
    }
}
