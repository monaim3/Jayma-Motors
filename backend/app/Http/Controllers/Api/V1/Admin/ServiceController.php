<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Content\ReorderRequest;
use App\Http\Requests\Admin\Content\ServiceRequest;
use App\Http\Resources\Content\AdminServiceResource;
use App\Models\Service;
use App\Services\Content\ServiceCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Services catalogue in the admin panel (Step 7 §11.8, permission content.manage).
 */
class ServiceController extends Controller
{
    /**
     * GET /admin/services — drafts included, in display order. ?search= and ?filter[status]=.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $services = Service::query()
            ->when($request->string('search')->trim()->value(), fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->when($request->input('filter.status'), fn ($query, $status) => $query->where('status', $status))
            ->ordered()
            ->get();

        return AdminServiceResource::collection($services);
    }

    public function store(ServiceRequest $request, ServiceCatalog $catalog): JsonResponse
    {
        $service = $catalog->create($request->validated());

        return AdminServiceResource::make($service)->response()->setStatusCode(201);
    }

    public function show(Service $service): AdminServiceResource
    {
        return AdminServiceResource::make($service);
    }

    public function update(ServiceRequest $request, Service $service, ServiceCatalog $catalog): AdminServiceResource
    {
        return AdminServiceResource::make($catalog->update($service, $request->validated()));
    }

    public function destroy(Service $service, ServiceCatalog $catalog): Response
    {
        $catalog->delete($service);

        return response()->noContent();
    }

    /** POST /admin/services/reorder — ids[] in display order. */
    public function reorder(ReorderRequest $request, ServiceCatalog $catalog): Response
    {
        $catalog->reorder($request->validated('ids'));

        return response()->noContent();
    }
}
