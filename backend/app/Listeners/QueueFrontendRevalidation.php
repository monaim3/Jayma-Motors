<?php

namespace App\Listeners;

use App\Events\PublicContentChanged;
use App\Jobs\RevalidateFrontend;

/**
 * Public content changed → refresh the website (Step 7 §5). Runs after the
 * response has been sent, so admin saves never wait on the website.
 */
class QueueFrontendRevalidation
{
    public function handle(PublicContentChanged $event): void
    {
        RevalidateFrontend::dispatchAfterResponse($event->tags);
    }
}
