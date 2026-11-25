/** Appointment helpers shared by the customer portal and the admin panel. */

export const APPOINTMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked in" },
  { value: "no_show", label: "No-show" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

/** "2026-12-02" → "Wed, 2 Dec 2026" (workshop timezone). */
export function formatAppointmentDate(value, { long = false } = {}) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: long ? "long" : "short",
    day: "numeric",
    month: long ? "long" : "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(`${value}T00:00:00+06:00`));
}

/** ISO timestamp → "25 Nov 2026, 6:12 PM" (workshop timezone). */
export function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
}

/** Audit event → what staff see in the booking history. */
export const TIMELINE_LABELS = {
  "appointment.booked": "Booked",
  "appointment.confirmed": "Confirmed",
  "appointment.rescheduled": "Rescheduled",
  "appointment.cancelled": "Cancelled",
  "appointment.checked_in": "Checked in",
  "appointment.no_show": "Marked no-show",
  "appointment.expired": "Expired (not confirmed in time)",
  "appointment.updated": "Details updated",
};
