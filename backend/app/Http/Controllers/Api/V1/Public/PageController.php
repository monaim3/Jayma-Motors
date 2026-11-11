<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Content\PageResource;
use App\Models\Page;

class PageController extends Controller
{
    /**
     * GET /pages/{key} — about, terms, privacy (published only).
     */
    public function __invoke(string $key): PageResource
    {
        return PageResource::make(
            Page::where('key', $key)->where('status', ContentStatus::Published)->firstOrFail()
        );
    }
}
