<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\AppointmentSource;
use App\Enums\AppointmentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Appointments\StoreAppointmentRequest;
use App\Http\Resources\Admin\AppointmentResource;
use App\Models\Appointment;
use App\Services\Appointments\AppointmentService;
use App\Services\Support\AuditLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

/**
 * Bookings in the admin panel (Step 7 §11.2, permission appointments.manage).
 */
class AppointmentController extends Controller
{
    public function __construct(private readonly AppointmentService $appointments) {}

    /**
     * GET /admin/appointments — filter[status|source|date_from|date_to|search],
     * sort=preferred_date|-preferred_date|created_at|-created_at (default: date, oldest first).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'filter.status' => ['nullable', Rule::in(array_column(AppointmentStatus::cases(), 'value'))],
            'filter.source' => ['nullable', Rule::enum(AppointmentSource::class)],
            'filter.date_from' => ['nullable', 'date_format:Y-m-d'],
            'filter.date_to' => ['nullable', 'date_format:Y-m-d'],
            'filter.search' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::in(['preferred_date', '-preferred_date', 'created_at', '-created_at'])],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        $sort = $request->input('sort', 'preferred_date');
        $search = trim((string) $request->input('filter.search'));

        $appointments = Appointment::query()
            ->with(['service', 'customer', 'creator'])
            ->when($request->input('filter.status'), fn (Builder $q, $status) => $q->where('status', $status))
            ->when($request->input('filter.source'), fn (Builder $q, $source) => $q->where('source', $source))
            ->when($request->input('filter.date_from'), fn (Builder $q, $from) => $q->whereDate('preferred_date', '>=', $from))
            ->when($request->input('filter.date_to'), fn (Builder $q, $to) => $q->whereDate('preferred_date', '<=', $to))
            ->when($search !== '', function (Builder $q) use ($search) {
                $digits = preg_replace('/\D/', '', $search);
                $q->where(function (Builder $q) use ($search, $digits) {
                    $q->where('reference', 'like', "%{$search}%")
                        ->orWhere('contact_name', 'like', "%{$search}%")
                        ->orWhere('registration_number_normalized', 'like', '%'.Appointment::normalizeRegistration($search).'%');
                    if (strlen($digits) >= 4) {
                        $q->orWhere('contact_phone', 'like', '%'.ltrim($digits, '0').'%');
                    }
                });
            })
            ->orderBy(ltrim($sort, '-'), str_starts_with($sort, '-') ? 'desc' : 'asc')
            ->orderBy('id')
            ->paginate($request->integer('per_page', 20));

        return AppointmentResource::collection($appointments);
    }

    /** POST /admin/appointments — staff booking (phone / walk-in). */
    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $appointment = $this->appointments->book($request->bookingData(), $request->user(), AppointmentSource::Staff);

        return $this->detail($appointment)->response()->setStatusCode(201);
    }

    /** GET /admin/appointments/{appointment} */
    public function show(Appointment $appointment): AppointmentResource
    {
        return $this->detail($appointment);
    }

    /**
     * PATCH /admin/appointments/{appointment} — time note, link a customer.
     * `notes` is the customer's own note (they see it in their account), so
     * staff can't overwrite it here; internal remarks need their own field.
     */
    public function update(Request $request, Appointment $appointment, AuditLogger $audit): AppointmentResource
    {
        $data = $request->validate([
            'time_note' => ['sometimes', 'nullable', 'string', 'max:50'],
            'customer_id' => ['sometimes', 'nullable', 'integer', 'exists:customers,id'],
        ]);

        $old = $appointment->only(array_keys($data));
        $appointment->update($data);
        $changed = array_diff_assoc(array_map('strval', $appointment->only(array_keys($data))), array_map('strval', $old));
        if ($changed !== []) {
            $audit->log('appointment.updated', $appointment, array_intersect_key($old, $changed), $changed);
        }

        return $this->detail($appointment);
    }

    /** POST /admin/appointments/{appointment}/confirm — time_note? */
    public function confirm(Request $request, Appointment $appointment): AppointmentResource
    {
        $data = $request->validate(['time_note' => ['nullable', 'string', 'max:50']]);

        return $this->detail($this->appointments->confirm($appointment, $data['time_note'] ?? null));
    }

    /** POST /admin/appointments/{appointment}/reschedule — preferred_date, reason, time_note? */
    public function reschedule(Request $request, Appointment $appointment): AppointmentResource
    {
        $data = $request->validate([
            'preferred_date' => ['required', 'date_format:Y-m-d'],
            'reason' => ['required', 'string', 'max:255'],
            'time_note' => ['nullable', 'string', 'max:50'],
        ]);

        return $this->detail($this->appointments->reschedule($appointment, $data['preferred_date'], $data['reason'], $data['time_note'] ?? null));
    }

    /** POST /admin/appointments/{appointment}/cancel — reason (required). */
    public function cancel(Request $request, Appointment $appointment): AppointmentResource
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:255']]);

        return $this->detail($this->appointments->cancel($appointment, $data['reason']));
    }

    /** POST /admin/appointments/{appointment}/check-in */
    public function checkIn(Appointment $appointment): AppointmentResource
    {
        return $this->detail($this->appointments->checkIn($appointment));
    }

    /** POST /admin/appointments/{appointment}/no-show */
    public function noShow(Appointment $appointment): AppointmentResource
    {
        return $this->detail($this->appointments->markNoShow($appointment));
    }

    private function detail(Appointment $appointment): AppointmentResource
    {
        return (new AppointmentResource($appointment->load(['service', 'customer', 'creator'])))->withTimeline();
    }
}
