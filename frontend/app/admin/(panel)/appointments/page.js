import { CalendarDays, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { serverFetch } from "@/lib/api/server-fetch";
import { APPOINTMENT_STATUSES, formatAppointmentDate } from "@/lib/appointments";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Appointments",
};

const TABS = [{ value: "", label: "All" }, ...APPOINTMENT_STATUSES.slice(0, 3)];

/** Build the list URL, keeping the other filters. */
function listHref(params, changes) {
  const next = new URLSearchParams({ ...params, ...changes });
  for (const [key, value] of [...next.entries()]) if (!value) next.delete(key);
  if (!("page" in changes)) next.delete("page");
  const query = next.toString();
  return `/admin/appointments${query ? `?${query}` : ""}`;
}

async function AppointmentTable({ searchParams }) {
  const params = Object.fromEntries(
    Object.entries(await searchParams).filter(
      ([key, value]) => ["status", "from", "to", "q", "page"].includes(key) && typeof value === "string",
    ),
  );

  const query = new URLSearchParams({ per_page: "20", page: params.page ?? "1" });
  if (params.status) query.set("filter[status]", params.status);
  if (params.from) query.set("filter[date_from]", params.from);
  if (params.to) query.set("filter[date_to]", params.to);
  if (params.q) query.set("filter[search]", params.q);

  const { data, meta } = await serverFetch(`/admin/appointments?${query}`, {
    loginPath: "/admin/login",
    cache: "no-store",
  });

  return (
    <div className="space-y-4">
      <nav aria-label="Status" className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = (params.status ?? "") === tab.value;
          return (
            <Link
              key={tab.value}
              href={listHref(params, { status: tab.value })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors ring-inset",
                active
                  ? "bg-ink-950 text-white ring-ink-950"
                  : "bg-white text-zinc-600 ring-zinc-300 hover:text-ink-950",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Plain GET form: filters live in the URL, so a list can be bookmarked or shared. */}
      <form action="/admin/appointments" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
        {params.status && <input type="hidden" name="status" value={params.status} />}
        <label className="relative block">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
          <Input name="q" defaultValue={params.q} placeholder="Reference, name, phone or car number" className="pl-9" />
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          From
          <Input type="date" name="from" defaultValue={params.from} className="w-auto" />
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          To
          <Input type="date" name="to" defaultValue={params.to} className="w-auto" />
        </label>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
        <Button href="/admin/appointments" variant="ghost">
          Clear
        </Button>
      </form>

      {data.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarDays} title="No bookings found" description="Try another status, date or search." />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Date
                </th>
                <th scope="col" className="px-4 py-3">
                  Customer
                </th>
                <th scope="col" className="px-4 py-3">
                  Car
                </th>
                <th scope="col" className="px-4 py-3">
                  Service
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.map((item) => (
                <tr key={item.id} className="relative transition-colors hover:bg-zinc-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/appointments/${item.id}`}
                      className="font-medium text-ink-950 after:absolute after:inset-0"
                    >
                      {formatAppointmentDate(item.preferred_date)}
                    </Link>
                    {item.time_note && <span className="block text-xs text-zinc-500">{item.time_note}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="block font-medium text-ink-950">{item.contact.name}</span>
                    <span className="text-xs text-zinc-500">{item.contact.phone_display}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block">
                      {item.vehicle.brand} {item.vehicle.model}
                    </span>
                    <span className="text-xs text-zinc-500">{item.vehicle.registration_number}</span>
                  </td>
                  <td className="px-4 py-3">{item.service?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                    {item.source === "staff" && <span className="mt-1 block text-xs text-zinc-500">Staff booking</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{item.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {meta.last_page > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-between text-sm text-zinc-600">
          <span>
            {meta.from}–{meta.to} of {meta.total}
          </span>
          <span className="flex gap-2">
            {meta.current_page > 1 && (
              <Button href={listHref(params, { page: String(meta.current_page - 1) })} variant="outline" size="sm">
                <ChevronLeft aria-hidden="true" />
                Previous
              </Button>
            )}
            {meta.current_page < meta.last_page && (
              <Button href={listHref(params, { page: String(meta.current_page + 1) })} variant="outline" size="sm">
                Next
                <ChevronRight aria-hidden="true" />
              </Button>
            )}
          </span>
        </nav>
      )}
    </div>
  );
}

/** Admin: bookings list (GET /admin/appointments). */
export default function AdminAppointmentsPage({ searchParams }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="mt-1 text-sm text-zinc-500">Website and phone bookings, oldest date first.</p>
        </div>
        <Button href="/admin/appointments/new" size="sm">
          <Plus aria-hidden="true" />
          New booking
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="space-y-3" aria-hidden="true">
            <Skeleton className="h-9 w-80" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        }
      >
        <AppointmentTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
