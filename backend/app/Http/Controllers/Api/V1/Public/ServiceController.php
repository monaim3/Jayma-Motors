<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Content\ServiceResource;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Published services (Step 7 §9).
 */
class ServiceController extends Controller
{
    /**
     * GET /services — in display order. ?filter[bookable]=1 for booking/enquiry dropdowns.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $services = Service::published()
            ->when($request->boolean('filter.bookable'), fn ($query) => $query->where('is_bookable', true))
            ->ordered()
            ->get();

        return ServiceResource::collection($services);
    }

    /**
     * GET /services/{slug} — page content plus up to 3 other services.
     */
    public function show(string $slug): ServiceResource
    {
        $service = Service::published()->where('slug', $slug)->firstOrFail();

        $service->setRelation('related', Service::published()->whereKeyNot($service->id)->ordered()->limit(3)->get());

        return ServiceResource::make($service)->detailed();
    }
}
