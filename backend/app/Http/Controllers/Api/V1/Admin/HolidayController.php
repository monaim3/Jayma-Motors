<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\StoreHolidayRequest;
use App\Models\Holiday;
use App\Services\Support\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Specific closed dates (Step 7 §11.9, permission settings.manage). Changes are
 * audited as settings changes (Step 3 §14).
 */
class HolidayController extends Controller
{
    /**
     * GET /admin/holidays — ordered by date. ?filter[upcoming]=1 hides past dates.
     */
    public function index(Request $request): JsonResponse
    {
        $holidays = Holiday::query()
            ->when($request->boolean('filter.upcoming'), fn ($query) => $query->where('date', '>=', now(config('app.business_timezone'))->toDateString()))
            ->orderBy('date')
            ->get(['id', 'date', 'name']);

        return response()->json(['data' => $holidays]);
    }

    /** POST /admin/holidays */
    public function store(StoreHolidayRequest $request, AuditLogger $audit): JsonResponse
    {
        $holiday = Holiday::create($request->validated());
        $audit->log('holiday.created', $holiday, null, self::values($holiday));

        return response()->json(['data' => ['id' => $holiday->id, ...self::values($holiday)]], 201);
    }

    /** DELETE /admin/holidays/{holiday} */
    public function destroy(Holiday $holiday, AuditLogger $audit): Response
    {
        $audit->log('holiday.deleted', $holiday, self::values($holiday));
        $holiday->delete();

        return response()->noContent();
    }

    /**
     * @return array{date: string, name: string}
     */
    private static function values(Holiday $holiday): array
    {
        return ['date' => $holiday->date->toDateString(), 'name' => $holiday->name];
    }
}
