<?php

namespace App\Http\Requests\Admin\Appointments;

use App\Http\Requests\Public\StoreAppointmentRequest as PublicStoreAppointmentRequest;

/**
 * POST /admin/appointments — a phone or walk-in booking entered by staff
 * (Step 7 §11.2). Same fields and rules as the website, plus: confirm it
 * straight away (with a time note) and link an existing customer.
 */
class StoreAppointmentRequest extends PublicStoreAppointmentRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'confirm' => ['sometimes', 'boolean'],
            'time_note' => ['nullable', 'string', 'max:50'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
        ];
    }
}
