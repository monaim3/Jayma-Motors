<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\VehicleRequest;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use App\Services\Vehicles\VehicleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Customer portal — my vehicles (Step 7 §10). Only the customer's own,
 * non-archived cars; anything else is a 404.
 */
class VehicleController extends Controller
{
    public function __construct(private readonly VehicleService $vehicles) {}

    /** GET /me/vehicles */
    public function index(Request $request): AnonymousResourceCollection
    {
        return VehicleResource::collection(
            Vehicle::query()
                ->where('customer_id', $this->customerId($request))
                ->active()
                ->orderBy('created_at')
                ->get(),
        );
    }

    /** POST /me/vehicles — 409 when the car is already in the system. */
    public function store(VehicleRequest $request): JsonResponse
    {
        $vehicle = $this->vehicles->addForCustomer($request->user()->customer, $request->validated(), $request->user());

        return (new VehicleResource($vehicle))->response()->setStatusCode(201);
    }

    /** PATCH /me/vehicles/{id} */
    public function update(VehicleRequest $request, int $id): VehicleResource
    {
        return new VehicleResource($this->vehicles->update($this->find($request, $id), $request->validated()));
    }

    /** DELETE /me/vehicles/{id} — deleted when it has no history, else archived. */
    public function destroy(Request $request, int $id): Response
    {
        $this->vehicles->archiveOrDelete($this->find($request, $id));

        return response()->noContent();
    }

    private function customerId(Request $request): int
    {
        return $request->user()->customer?->id ?? 0;
    }

    private function find(Request $request, int $id): Vehicle
    {
        return Vehicle::query()
            ->where('customer_id', $this->customerId($request))
            ->active()
            ->findOrFail($id);
    }
}
