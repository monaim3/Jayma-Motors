<?php

namespace App\Services\Appointments;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Holiday;
use App\Services\Settings\SettingsService;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Illuminate\Validation\ValidationException;

/**
 * Which dates can be booked (Step 3 §6.1): today up to the booking window
 * (Settings, default 60 days), never a closed weekday or holiday, and not a
 * day that has reached the optional daily limit. Dates are workshop dates
 * (Asia/Dhaka), whatever the server's timezone.
 */
final class BookingRules
{
    public function __construct(private readonly SettingsService $settings) {}

    public function today(): CarbonImmutable
    {
        return CarbonImmutable::now(config('app.business_timezone'))->startOfDay();
    }

    public function maxDate(): CarbonImmutable
    {
        return $this->today()->addDays((int) $this->settings->get('appointments.booking_window_days', 60));
    }

    /**
     * Closed weekdays and holidays between two dates (inclusive).
     *
     * @return list<string> Y-m-d
     */
    public function closedDates(CarbonImmutable $from, CarbonImmutable $to): array
    {
        $weekdays = array_map('intval', (array) $this->settings->get('appointments.closed_weekdays', []));
        $holidays = Holiday::query()
            ->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->pluck('date')
            ->map(fn ($date) => $date->toDateString())
            ->all();

        $closed = [];
        foreach (CarbonPeriod::create($from, $to) as $day) {
            if (in_array($day->dayOfWeek, $weekdays, true) || in_array($day->toDateString(), $holidays, true)) {
                $closed[] = $day->toDateString();
            }
        }

        return $closed;
    }

    /**
     * Days that have reached the daily limit (empty when no limit is set).
     *
     * @return list<string> Y-m-d
     */
    public function fullDates(CarbonImmutable $from, CarbonImmutable $to): array
    {
        $limit = $this->settings->get('appointments.daily_limit');
        if (! $limit) {
            return [];
        }

        return Appointment::query()
            ->whereBetween('preferred_date', [$from->toDateString(), $to->toDateString()])
            ->whereIn('status', AppointmentStatus::occupying())
            ->groupBy('preferred_date')
            ->havingRaw('COUNT(*) >= ?', [(int) $limit])
            ->pluck('preferred_date')
            ->map(fn ($date) => $date->toDateString())
            ->values()
            ->all();
    }

    /**
     * Throws a validation error on `preferred_date` when the date can't be booked.
     */
    public function assertBookable(CarbonImmutable $date): void
    {
        $date = $date->startOfDay();

        $message = match (true) {
            $date->lt($this->today()) => 'Please choose today or a later date.',
            $date->gt($this->maxDate()) => 'Bookings open up to '.$this->maxDate()->format('j F Y').'. Please choose an earlier date.',
            $this->closedDates($date, $date) !== [] => 'The workshop is closed on this day. Please choose another date.',
            $this->fullDates($date, $date) !== [] => 'This day is fully booked. Please choose another date.',
            default => null,
        };

        if ($message !== null) {
            throw ValidationException::withMessages(['preferred_date' => $message]);
        }
    }
}
