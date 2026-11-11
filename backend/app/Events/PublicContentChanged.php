<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;

/**
 * Something the public website shows has changed (Step 7 §5).
 * QueueFrontendRevalidation asks Next.js to refresh the matching cache tags.
 */
class PublicContentChanged
{
    use Dispatchable;

    /**
     * @param  list<string>  $tags  frontend cache tags, e.g. ['settings'], ['services', 'service:engine-repair']
     */
    public function __construct(public readonly array $tags) {}
}
