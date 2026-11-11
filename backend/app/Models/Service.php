<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A workshop service (Step 4 §6.1). included/signs are lists of strings;
 * faqs is a list of { q, a }.
 */
#[Fillable([
    'name', 'slug', 'short_description', 'headline', 'description', 'icon', 'duration',
    'included', 'signs', 'faqs', 'image_path', 'image_alt', 'is_bookable', 'status',
    'sort_order', 'meta_title', 'meta_description',
])]
class Service extends Model
{
    use SoftDeletes;

    /** Icons the website can draw (lucide-react names used by the frontend). */
    public const ICONS = [
        'Cog', 'Cpu', 'Wrench', 'Hammer', 'PaintRoller', 'CircleDot', 'ClipboardCheck', 'BatteryCharging',
        'Car', 'Droplets', 'Gauge', 'Fan', 'Snowflake', 'Zap', 'ShieldCheck', 'Sparkles',
    ];

    protected function casts(): array
    {
        return [
            'included' => 'array',
            'signs' => 'array',
            'faqs' => 'array',
            'is_bookable' => 'boolean',
            'status' => ContentStatus::class,
            'sort_order' => 'integer',
        ];
    }

    /** @param  Builder<self>  $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', ContentStatus::Published);
    }

    /** @param  Builder<self>  $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('name');
    }

    public function isPublished(): bool
    {
        return $this->status === ContentStatus::Published;
    }

    /**
     * Whether appointments, enquiries or service records point at this service,
     * in which case it can only be unpublished, never deleted (Step 3 §10).
     * Those tables arrive in B3/B5/B6, which extend this check.
     */
    public function isInUse(): bool
    {
        return false;
    }
}
