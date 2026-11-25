<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreAppointmentRequest;
use App\Services\Appointments\AppointmentService;
use App\Services\Appointments\BookingRules;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public booking (Step 7 §9): which dates can be picked, and making a booking.
 */
class AppointmentController extends Controller
{
    /** At most this many days per availability request. */
    private const MAX_RANGE_DAYS = 92;

    /**
     * GET /appointments/availability?from=&to= → { max_date, closed_dates[], full_dates[] }.
     * Defaults to the whole booking window.
     */
    public function availability(Request $request, BookingRules $rules): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $tz = config('app.business_timezone');
        $from = $request->filled('from') ? CarbonImmutable::parse($request->input('from'), $tz) : $rules->today();
        $from = $from->max($rules->today());
        $to = $request->filled('to') ? CarbonImmutable::parse($request->input('to'), $tz) : $rules->maxDate();
        $to = $to->min($rules->maxDate())->min($from->addDays(self::MAX_RANGE_DAYS));

        return response()->json([
            'data' => [
                'today' => $rules->today()->toDateString(),
                'max_date' => $rules->maxDate()->toDateString(),
                'closed_dates' => $to->lt($from) ? [] : $rules->closedDates($from, $to),
                'full_dates' => $to->lt($from) ? [] : $rules->fullDates($from, $to),
            ],
        ]);
    }

    /** POST /appointments → 201 { reference, status, preferred_date }. */
    public function store(StoreAppointmentRequest $request, AppointmentService $appointments): JsonResponse
    {
        $user = $request->user('sanctum');
        $appointment = $appointments->book($request->bookingData(), $user?->isCustomer() ? $user : null);

        return response()->json([
            'data' => [
                'reference' => $appointment->reference,
                'status' => $appointment->status->value,
                'preferred_date' => $appointment->preferred_date->toDateString(),
            ],
        ], 201);
    }
}
