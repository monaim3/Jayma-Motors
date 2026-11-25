<x-mail::message>
# {{ match ($kind) {
    'confirmed' => 'Your appointment is confirmed',
    'rescheduled' => 'Your appointment date has changed',
    'cancelled' => 'Your appointment was cancelled',
    default => 'Thank you for your booking',
} }}

Hello {{ $appointment->contact_name }},

@switch($kind)
@case('confirmed')
Your appointment at Jayma Motors is **confirmed**. We look forward to seeing you.
@break
@case('rescheduled')
Your appointment has been moved to a new date. The details are below.
@break
@case('cancelled')
Your appointment has been **cancelled**.@if ($appointment->cancellation_reason) Reason: {{ $appointment->cancellation_reason }}@endif
@break
@default
We have received your booking request. **Our team will call you to confirm the time.**
@endswitch

<x-mail::panel>
**Reference:** {{ $appointment->reference }}<br>
**Date:** {{ $appointment->preferred_date->format('l, j F Y') }}@if ($appointment->time_note) at {{ $appointment->time_note }}@endif<br>
**Service:** {{ $appointment->service?->name ?? '—' }}<br>
**Car:** {{ $appointment->vehicle_brand }} {{ $appointment->vehicle_model }} ({{ $appointment->registration_number }})
</x-mail::panel>

@if ($appointment->customer_id && $kind !== 'cancelled')
<x-mail::button :url="$accountUrl">
View my appointments
</x-mail::button>
@endif

@if ($phone)
Need to change something? Call us on **{{ $phone }}** and mention your reference.
@endif

Thanks,<br>
Jayma Motors
</x-mail::message>
