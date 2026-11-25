<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\VehicleBrand;
use Illuminate\Http\JsonResponse;

/** GET /vehicle-brands — active brands, in display order (Step 7 §9). */
class VehicleBrandController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => VehicleBrand::query()->active()->ordered()->get(['id', 'name', 'slug']),
        ]);
    }
}
