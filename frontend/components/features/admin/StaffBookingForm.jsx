"use client";

import { CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { api, ensureCsrfCookie } from "@/lib/api/browser-client";
import { VEHICLE_BRANDS } from "@/lib/home-content";

/**
 * Staff booking for a phone or walk-in customer (POST /admin/appointments).
 * Same rules as the website; can be confirmed straight away with a time.
 */
export function StaffBookingForm({ services }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(true);

  const onSubmit = async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setErrors({});
    try {
      await ensureCsrfCookie();
      const { data } = await api.post("/admin/appointments", { ...values, confirm });
      toast.success(`Booking ${data.data.reference} saved`, {
        description: values.contact_email ? "The customer is emailed." : undefined,
      });
      router.push(`/admin/appointments/${data.data.id}`);
    } catch (error) {
      if (error.isValidation) setErrors(error.fieldErrors);
      else toast.error(error.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-3 text-sm font-semibold text-ink-950">Customer</legend>
        <FormField id="sb-name" label="Name" required error={errors.contact_name}>
          <Input name="contact_name" autoComplete="off" maxLength={100} />
        </FormField>
        <FormField id="sb-phone" label="Phone" required error={errors.contact_phone}>
          <Input name="contact_phone" type="tel" inputMode="tel" placeholder="01XXXXXXXXX" />
        </FormField>
        <FormField id="sb-email" label="Email" hint="For the confirmation email." error={errors.contact_email}>
          <Input name="contact_email" type="email" />
        </FormField>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-3 text-sm font-semibold text-ink-950">Car</legend>
        <FormField id="sb-brand" label="Brand" required error={errors.vehicle_brand}>
          <Select name="vehicle_brand" defaultValue="">
            <option value="">Select brand</option>
            {VEHICLE_BRANDS.map((brand) => (
              <option key={brand}>{brand}</option>
            ))}
          </Select>
        </FormField>
        <FormField id="sb-model" label="Model" required error={errors.vehicle_model}>
          <Input name="vehicle_model" maxLength={80} />
        </FormField>
        <FormField id="sb-reg" label="Car number" required error={errors.registration_number}>
          <Input name="registration_number" maxLength={40} placeholder="Dhaka Metro Ga 12-3456" />
        </FormField>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-3 text-sm font-semibold text-ink-950">Booking</legend>
        <FormField id="sb-service" label="Service" required error={errors.service}>
          <Select name="service" defaultValue="">
            <option value="">Select service</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="sb-date" label="Date" required error={errors.preferred_date}>
          <Input name="preferred_date" type="date" />
        </FormField>
        <FormField id="sb-time" label="Time" hint='e.g. "10:30 AM"' error={errors.time_note}>
          <Input name="time_note" maxLength={50} disabled={!confirm} />
        </FormField>
        <FormField id="sb-notes" label="Notes" className="sm:col-span-3" error={errors.notes}>
          <Textarea name="notes" rows={2} maxLength={1000} placeholder="What the customer described" />
        </FormField>
      </fieldset>

      <label className="flex items-start gap-3 rounded-card bg-zinc-50 p-4 text-sm">
        <input
          type="checkbox"
          checked={confirm}
          onChange={(event) => setConfirm(event.target.checked)}
          className="mt-0.5 size-4 accent-brand-600"
        />
        <span>
          <span className="font-medium text-ink-950">Confirm now</span>
          <span className="block text-zinc-500">Agreed with the customer on the phone. Untick to keep it pending.</span>
        </span>
      </label>

      <Button type="submit" loading={busy}>
        {!busy && <CalendarPlus aria-hidden="true" />}
        Save booking
      </Button>
    </form>
  );
}
