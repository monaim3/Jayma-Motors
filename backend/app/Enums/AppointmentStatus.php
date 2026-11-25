<?php

namespace App\Enums;

/**
 * Appointment status flow (Step 3 §6.2).
 *
 * pending ──confirm──► confirmed ──check-in──► checked_in
 *    │                    └──no-show (on/after the date)──► no_show
 *    └──cancel (customer before the date, or staff)──► cancelled
 * Pending bookings whose date has passed become expired each night.
 */
enum AppointmentStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case CheckedIn = 'checked_in';
    case Cancelled = 'cancelled';
    case NoShow = 'no_show';
    case Expired = 'expired';

    /** Statuses that still hold a place on the day (duplicate check, daily limit). */
    public static function active(): array
    {
        return [self::Pending, self::Confirmed];
    }

    /** Statuses that count toward the optional daily limit. */
    public static function occupying(): array
    {
        return [self::Pending, self::Confirmed, self::CheckedIn];
    }

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Confirmed => 'Confirmed',
            self::CheckedIn => 'Checked in',
            self::Cancelled => 'Cancelled',
            self::NoShow => 'No-show',
            self::Expired => 'Expired',
        };
    }
}
