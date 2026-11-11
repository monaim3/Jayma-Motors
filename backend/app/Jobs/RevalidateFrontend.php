<?php

namespace App\Jobs;

use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Asks Next.js to refresh cached pages for the given tags (Step 7 §5):
 * POST {FRONTEND_URL}/api/revalidate with the shared secret.
 *
 * Best effort: if the website can't be reached, it still refreshes on its own
 * within 10 minutes (cacheLife "content"), so a failure is logged, not retried.
 */
class RevalidateFrontend
{
    use Dispatchable;

    /**
     * @param  list<string>  $tags
     */
    public function __construct(public readonly array $tags) {}

    public function handle(): void
    {
        $secret = config('app.revalidate_secret');

        if (! $secret || $this->tags === []) {
            return;
        }

        try {
            Http::timeout(5)
                ->acceptJson()
                ->withHeaders(['X-Revalidate-Secret' => $secret])
                ->post(rtrim((string) config('app.frontend_url'), '/').'/api/revalidate', ['tags' => $this->tags])
                ->throw();
        } catch (Throwable $e) {
            Log::warning('Frontend revalidation failed', ['tags' => $this->tags, 'error' => $e->getMessage()]);
        }
    }
}
