<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ContentStatus;
use App\Events\PublicContentChanged;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Content\UpdatePageRequest;
use App\Http\Resources\Content\PageResource;
use App\Models\Page;
use App\Services\Content\SlugService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Mews\Purifier\Facades\Purifier;

/**
 * Editable pages (About, Terms, Privacy) — list, view and edit only (Step 7 §11.8).
 */
class PageController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PageResource::collection(Page::orderBy('title')->get());
    }

    public function show(Page $page): PageResource
    {
        return PageResource::make($page);
    }

    public function update(UpdatePageRequest $request, Page $page, SlugService $slugs): PageResource
    {
        $data = $request->validated();
        if (array_key_exists('body', $data) && $data['body'] !== null) {
            $data['body'] = Purifier::clean($data['body'], 'content') ?: null;
        }

        $oldSlug = $page->slug;
        $wasPublished = $page->status === ContentStatus::Published;

        DB::transaction(function () use ($page, $data, $slugs, $oldSlug, $wasPublished) {
            $page->fill($data)->save();

            if ($wasPublished && $page->slug !== $oldSlug) {
                $slugs->redirect("/{$oldSlug}", "/{$page->slug}");
            }
        });

        PublicContentChanged::dispatch(['pages', "page:{$page->key}"]);

        return PageResource::make($page);
    }
}
