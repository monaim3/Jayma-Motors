"use client";

import { CalendarClock, CheckCheck, CircleCheck, CircleX, LogIn, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { api, ensureCsrfCookie } from "@/lib/api/browser-client";

/**
 * Staff actions for one booking. Only the actions the API allows right now
 * are shown (`appointment.actions`); the API still checks every request.
 */
export function AppointmentActions({ appointment }) {
  const router = useRouter();
  const [open, setOpen] = useState(null); // "confirm" | "reschedule" | "cancel"
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const { actions } = appointment;

  const run = async (path, body, success) => {
    setBusy(true);
    setErrors({});
    try {
      await ensureCsrfCookie();
      await api.post(`/admin/appointments/${appointment.id}/${path}`, body);
      toast.success(success);
      setOpen(null);
      router.refresh();
    } catch (error) {
      if (error.isValidation) setErrors(error.fieldErrors);
      else toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = (path, success) => (event) => {
    event.preventDefault();
    run(path, Object.fromEntries(new FormData(event.currentTarget)), success);
  };

  if (!Object.values(actions).some(Boolean)) {
    return (
      <p className="text-sm text-zinc-500">
        No further actions for a {appointment.status_label.toLowerCase()} booking.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {actions.confirm && (
          <Button size="sm" onClick={() => setOpen(open === "confirm" ? null : "confirm")}>
            <CircleCheck aria-hidden="true" />
            Confirm
          </Button>
        )}
        {actions.check_in && (
          <Button size="sm" loading={busy} onClick={() => run("check-in", {}, "Car checked in")}>
            {!busy && <LogIn aria-hidden="true" />}
            Check in
          </Button>
        )}
        {actions.reschedule && (
          <Button size="sm" variant="outline" onClick={() => setOpen(open === "reschedule" ? null : "reschedule")}>
            <CalendarClock aria-hidden="true" />
            Reschedule
          </Button>
        )}
        {actions.no_show && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => window.confirm("Mark this booking as a no-show?") && run("no-show", {}, "Marked as no-show")}
          >
            <UserX aria-hidden="true" />
            No-show
          </Button>
        )}
        {actions.cancel && (
          <Button size="sm" variant="ghost" onClick={() => setOpen(open === "cancel" ? null : "cancel")}>
            <CircleX aria-hidden="true" />
            Cancel booking
          </Button>
        )}
      </div>

      {open === "confirm" && (
        <form
          onSubmit={submit("confirm", "Booking confirmed — the customer is emailed")}
          className="space-y-3 rounded-card bg-zinc-50 p-4"
        >
          <FormField
            id="confirm-time"
            label="Time (optional)"
            hint='Shown to the customer, e.g. "10:30 AM".'
            error={errors.time_note}
          >
            <Input name="time_note" defaultValue={appointment.time_note ?? ""} maxLength={50} className="max-w-xs" />
          </FormField>
          <Button type="submit" size="sm" loading={busy}>
            {!busy && <CheckCheck aria-hidden="true" />}
            Confirm booking
          </Button>
        </form>
      )}

      {open === "reschedule" && (
        <form
          onSubmit={submit("reschedule", "Booking moved — the customer is emailed")}
          className="space-y-3 rounded-card bg-zinc-50 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id="reschedule-date" label="New date" required error={errors.preferred_date}>
              <Input type="date" name="preferred_date" required />
            </FormField>
            <FormField id="reschedule-time" label="Time (optional)" error={errors.time_note}>
              <Input name="time_note" maxLength={50} />
            </FormField>
          </div>
          <FormField id="reschedule-reason" label="Reason" required error={errors.reason}>
            <Input name="reason" required maxLength={255} placeholder="e.g. Customer asked for a later day" />
          </FormField>
          <Button type="submit" size="sm" loading={busy}>
            Save new date
          </Button>
        </form>
      )}

      {open === "cancel" && (
        <form
          onSubmit={submit("cancel", "Booking cancelled — the customer is emailed")}
          className="space-y-3 rounded-card bg-zinc-50 p-4"
        >
          <FormField
            id="cancel-reason"
            label="Reason"
            required
            hint="The customer sees this in their email."
            error={errors.reason}
          >
            <Textarea name="reason" rows={2} required maxLength={255} />
          </FormField>
          <Button type="submit" size="sm" variant="secondary" loading={busy}>
            Cancel this booking
          </Button>
        </form>
      )}
    </div>
  );
}
