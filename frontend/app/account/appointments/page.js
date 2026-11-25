import { CalendarCheck, CalendarDays, Car, Clock, Wrench } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CancelAppointmentButton } from "@/components/features/account/CancelAppointmentButton";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { serverFetch } from "@/lib/api/server-fetch";
import { BOOKING_HREF } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "My Appointments",
};

const TABS = [
  { scope: "upcoming", label: "Upcoming" },
  { scope: "past", label: "Past & cancelled" },
];

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(`${value}T00:00:00+06:00`));
}

/** One booking: date block, service and car, status, cancel when still allowed. */
function AppointmentCard({ appointment }) {
  const [day, month] = formatDate(appointment.preferred_date).replace(",", "").split(" ").slice(1, 3);
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-card bg-brand-50 text-brand-700">
        <span className="text-2xl leading-none font-bold">{day}</span>
        <span className="mt-1 text-xs font-semibold tracking-wide uppercase">{month?.slice(0, 3)}</span>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-ink-950">{appointment.service?.name ?? "Service"}</p>
          <StatusBadge status={appointment.status} />
        </div>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4 text-zinc-400" aria-hidden="true" />
            {formatDate(appointment.preferred_date)}
          </span>
          {appointment.time_note && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-zinc-400" aria-hidden="true" />
              {appointment.time_note}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Car className="size-4 text-zinc-400" aria-hidden="true" />
            {appointment.vehicle.brand} {appointment.vehicle.model} · {appointment.vehicle.registration_number}
          </span>
        </p>
        <p className="text-xs text-zinc-500">
          Reference <span className="font-mono">{appointment.reference}</span>
          {appointment.status === "pending" && " · We'll call you to confirm the time."}
          {appointment.cancellation_reason && ` · Reason: ${appointment.cancellation_reason}`}
        </p>
      </div>

      {appointment.can_cancel && (
        <CancelAppointmentButton reference={appointment.reference} date={formatDate(appointment.preferred_date)} />
      )}
    </Card>
  );
}

async function AppointmentList({ searchParams }) {
  const { scope: requested } = await searchParams;
  const scope = requested === "past" ? "past" : "upcoming";
  const { data } = await serverFetch(`/me/appointments?filter[scope]=${scope}`, { cache: "no-store" });

  return (
    <>
      <nav aria-label="Appointment lists" className="flex gap-2 border-b border-zinc-200">
        {TABS.map((tab) => (
          <Link
            key={tab.scope}
            href={tab.scope === "upcoming" ? "/account/appointments" : `/account/appointments?scope=${tab.scope}`}
            aria-current={tab.scope === scope ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab.scope === scope
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-zinc-500 hover:text-ink-950",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {data.length === 0 ? (
        <Card>
          <EmptyState
            icon={scope === "upcoming" ? CalendarCheck : Wrench}
            title={scope === "upcoming" ? "No upcoming appointments" : "Nothing here yet"}
            description={
              scope === "upcoming"
                ? "Book a visit and it will appear here, with its status."
                : "Finished, missed and cancelled bookings will appear here."
            }
            action={
              scope === "upcoming" && (
                <Button href={BOOKING_HREF} size="sm">
                  <CalendarCheck aria-hidden="true" />
                  Book an appointment
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {data.map((appointment) => (
            <li key={appointment.reference}>
              <AppointmentCard appointment={appointment} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}

/** Customer portal: my bookings (GET /me/appointments). */
export default function MyAppointmentsPage({ searchParams }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My appointments</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your bookings and their status. You can cancel up to the day before.
          </p>
        </div>
        <Button href={BOOKING_HREF} size="sm">
          <CalendarCheck aria-hidden="true" />
          New booking
        </Button>
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <AppointmentList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
