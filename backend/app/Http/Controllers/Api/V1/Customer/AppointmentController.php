<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Enums\AppointmentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Customer\AppointmentResource;
use App\Models\Appointment;
use App\Services\Appointments\AppointmentService;
use App\Services\Appointments\BookingRules;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

/**
 * Customer portal — my appointments (Step 7 §10). Customers only ever see
 * bookings linked to their own customer profile; anything else is a 404.
 */
class AppointmentController extends Controller
{
    /** GET /me/appointments?filter[scope]=upcoming|past */
    public function index(Request $request, BookingRules $rules): AnonymousResourceCollection
    {
        $request->validate([
            'filter.scope' => ['nullable', Rule::in(['upcoming', 'past'])],
        ]);

        $today = $rules->today()->toDateString();
        $upcoming = fn (Builder $query) => $query
            ->whereDate('preferred_date', '>=', $today)
            ->whereIn('status', AppointmentStatus::active());

        $appointments = $this->mine($request)
            ->with('service')
            ->when($request->input('filter.scope') === 'upcoming', function (Builder $query) use ($upcoming) {
                $upcoming($query);
                $query->orderBy('preferred_date')->orderBy('id');
            })
            ->when($request->input('filter.scope') === 'past', function (Builder $query) use ($upcoming) {
                $query->whereNot(fn (Builder $q) => $upcoming($q))
                    ->orderByDesc('preferred_date')->orderByDesc('id');
            })
            ->when(! $request->filled('filter.scope'), fn (Builder $query) => $query->orderByDesc('preferred_date')->orderByDesc('id'))
            ->paginate(10);

        return AppointmentResource::collection($appointments);
    }

    /** GET /me/appointments/{reference} */
    public function show(Request $request, string $reference): AppointmentResource
    {
        return (new AppointmentResource($this->find($request, $reference)->load('service')))->withTimeline();
    }

    /** POST /me/appointments/{reference}/cancel — before the date only, else 409. */
    public function cancel(Request $request, string $reference, AppointmentService $appointments): AppointmentResource
    {
        $data = $request->validate(['reason' => ['nullable', 'string', 'max:255']]);
        $appointment = $appointments->cancel($this->find($request, $reference), $data['reason'] ?? null, byCustomer: true);

        return (new AppointmentResource($appointment->load('service')))->withTimeline();
    }

    /** @return Builder<Appointment> */
    private function mine(Request $request): Builder
    {
        return Appointment::query()->where('customer_id', $request->user()->customer?->id ?? 0);
    }

    private function find(Request $request, string $reference): Appointment
    {
        return $this->mine($request)->where('reference', $reference)->firstOrFail();
    }
}
