<x-mail::message>
# {{ $kind === 'cancelled' ? 'Booking cancelled by the customer' : 'New booking request' }}

@if ($kind === 'cancelled')
The customer cancelled this booking from their account.
@else
A new booking was made on the website. Please call the customer to confirm the time.
@endif

<x-mail::table>
| | |
|:--|:--|
| **Reference** | {{ $appointment->reference }} |
| **Date** | {{ $appointment->preferred_date->format('l, j F Y') }} |
| **Name** | {{ $appointment->contact_name }} |
| **Phone** | {{ $phone }} |
| **Email** | {{ $appointment->contact_email ?? '—' }} |
| **Car** | {{ $appointment->vehicle_brand }} {{ $appointment->vehicle_model }} |
| **Car number** | {{ $appointment->registration_number }} |
| **Service** | {{ $appointment->service?->name ?? '—' }} |
@if ($appointment->notes)
| **Notes** | {{ $appointment->notes }} |
@endif
</x-mail::table>

<x-mail::button :url="$adminUrl">
Open the admin panel
</x-mail::button>

Jayma Motors website
</x-mail::message>
