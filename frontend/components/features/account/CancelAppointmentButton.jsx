"use client";

import { LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api, ensureCsrfCookie } from "@/lib/api/browser-client";

/** Cancel one of my bookings (POST /me/appointments/{reference}/cancel), after a confirmation. */
export function CancelAppointmentButton({ reference, date }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const cancel = async () => {
    if (!window.confirm(`Cancel your appointment on ${date}?`)) return;
    setBusy(true);
    try {
      await ensureCsrfCookie();
      await api.post(`/me/appointments/${reference}/cancel`);
      toast.success("Appointment cancelled", { description: `Reference ${reference}.` });
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-control border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-danger-600 hover:text-danger-700 disabled:opacity-60"
    >
      {busy ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <X className="size-4" aria-hidden="true" />
      )}
      Cancel
    </button>
  );
}
