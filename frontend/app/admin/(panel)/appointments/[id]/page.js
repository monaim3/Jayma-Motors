import { ArrowLeft, Car, Mail, Phone, StickyNote, UserRound, Wrench } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AppointmentActions } from "@/components/features/admin/AppointmentActions";
import { StatusBadge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { serverFetch } from "@/lib/api/server-fetch";
import { TIMELINE_LABELS, formatAppointmentDate, formatDateTime } from "@/lib/appointments";

export const metadata = {
  title: "Appointment",
};

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-zinc-400" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs font-medium text-zinc-500">{label}</dt>
        <dd className="text-sm text-ink-950">{children}</dd>
      </div>
    </div>
  );
}

/** One history line: "Rescheduled · 27 Nov → 1 Dec · Lift under repair — by Karim, 25 Nov 2026, 6:12 PM". */
function TimelineItem({ entry }) {
  const changes = [];
  if (entry.event === "appointment.rescheduled" && entry.old?.preferred_date) {
    changes.push(
      `${formatAppointmentDate(entry.old.preferred_date)} → ${formatAppointmentDate(entry.new.preferred_date)}`,
    );
  }
  if (entry.new?.time_note) changes.push(`Time: ${entry.new.time_note}`);
  if (entry.event === "appointment.cancelled" && entry.new?.by === "customer") changes.push("by the customer online");

  return (
    <li className="relative pb-5 pl-6 last:pb-0">
      <span
        aria-hidden="true"
        className="absolute top-1.5 left-0 size-2.5 rounded-full bg-brand-600 ring-4 ring-brand-50"
      />
      <p className="text-sm font-medium text-ink-950">
        {TIMELINE_LABELS[entry.event] ?? entry.event}
        {changes.length > 0 && <span className="font-normal text-zinc-600"> · {changes.join(" · ")}</span>}
      </p>
      {entry.note && <p className="mt-0.5 text-sm text-zinc-600">“{entry.note}”</p>}
      <p className="mt-0.5 text-xs text-zinc-500">
        {entry.by ? `by ${entry.by}, ` : entry.event === "appointment.booked" ? "on the website, " : ""}
        {formatDateTime(entry.at)}
      </p>
    </li>
  );
}

async function AppointmentDetail({ params }) {
  const { id } = await params;
  const { data: item } = await serverFetch(`/admin/appointments/${encodeURIComponent(id)}`, {
    loginPath: "/admin/login",
    cache: "no-store",
  });

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-zinc-500">{item.reference}</p>
          <h1 className="mt-1 text-2xl font-bold">
            {formatAppointmentDate(item.preferred_date, { long: true })}
            {item.time_note && <span className="font-normal text-zinc-500"> · {item.time_note}</span>}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
            <StatusBadge status={item.status} />
            {item.source === "staff"
              ? `Staff booking${item.created_by ? ` by ${item.created_by}` : ""}`
              : "Website booking"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Actions" description="The customer is emailed when you confirm, reschedule or cancel." />
            <CardBody>
              <AppointmentActions appointment={item} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Booking details" />
            <CardBody>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Row icon={UserRound} label="Name">
                  {item.contact.name}
                  {item.customer && (
                    <span className="block text-xs text-zinc-500">
                      Customer record #{item.customer.id}
                      {item.customer.has_account ? " · has an online account" : ""}
                    </span>
                  )}
                </Row>
                <Row icon={Phone} label="Phone">
                  <a href={`tel:${item.contact.phone}`} className="text-brand-700 hover:underline">
                    {item.contact.phone_display}
                  </a>
                </Row>
                <Row icon={Mail} label="Email">
                  {item.contact.email ? (
                    <a href={`mailto:${item.contact.email}`} className="text-brand-700 hover:underline">
                      {item.contact.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </Row>
                <Row icon={Car} label="Car">
                  {item.vehicle.brand} {item.vehicle.model}
                  <span className="block text-xs text-zinc-500">{item.vehicle.registration_number}</span>
                </Row>
                <Row icon={Wrench} label="Service">
                  {item.service?.name ?? "—"}
                </Row>
                <Row icon={StickyNote} label="Customer notes">
                  {item.notes || "—"}
                </Row>
              </dl>
              {item.cancellation_reason && (
                <p className="mt-4 rounded-control bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                  Cancellation reason: {item.cancellation_reason}
                </p>
              )}
            </CardBody>
          </Card>
        </div>

        <Card className="self-start">
          <CardHeader title="History" />
          <CardBody>
            <ol>
              {item.timeline.map((entry, index) => (
                <TimelineItem key={`${entry.event}-${index}`} entry={entry} />
              ))}
            </ol>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

/** Admin: one booking (GET /admin/appointments/{id}) with its actions and history. */
export default function AdminAppointmentPage({ params }) {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/appointments"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-ink-950"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All appointments
      </Link>
      <Suspense
        fallback={
          <div className="space-y-4" aria-hidden="true">
            <Skeleton className="h-16 w-72" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <AppointmentDetail params={params} />
      </Suspense>
    </div>
  );
}
