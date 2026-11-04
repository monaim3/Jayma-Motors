<?php

namespace App\Services\Support;

use Illuminate\Support\Facades\DB;

/**
 * Human-readable, never-reused reference numbers such as APT-2026-00012
 * (Step 3 §3, Step 4 §13.2).
 *
 * The counter row is locked (SELECT ... FOR UPDATE), so simultaneous
 * requests never receive the same number. Call it inside the transaction
 * that creates the record, so a failed save does not consume a number.
 */
final class ReferenceNumberGenerator
{
    public const APPOINTMENT = 'APT';

    public const ENQUIRY = 'ENQ';

    public const SERVICE_RECORD = 'SR';

    public function next(string $prefix): string
    {
        $year = (int) now(config('app.business_timezone'))->format('Y');

        $number = DB::transaction(function () use ($prefix, $year) {
            DB::table('reference_counters')->insertOrIgnore([
                'prefix' => $prefix,
                'year' => $year,
                'last_number' => 0,
            ]);

            $counter = DB::table('reference_counters')
                ->where('prefix', $prefix)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            $next = $counter->last_number + 1;

            DB::table('reference_counters')
                ->where('id', $counter->id)
                ->update(['last_number' => $next]);

            return $next;
        });

        return sprintf('%s-%d-%05d', $prefix, $year, $number);
    }
}
