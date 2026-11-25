import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StaffBookingForm } from "@/components/features/admin/StaffBookingForm";
import { Card, CardBody } from "@/components/ui/Card";
import { getServices } from "@/lib/api/content";

export const metadata = {
  title: "New booking",
};

/** Admin: book for a phone or walk-in customer. */
export default async function NewAppointmentPage() {
  const services = (await getServices())
    .filter((service) => service.isBookable)
    .map(({ slug, name }) => ({ slug, name }));

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/appointments"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-ink-950"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All appointments
      </Link>
      <div>
        <h1 className="text-2xl font-bold">New booking</h1>
        <p className="mt-1 text-sm text-zinc-500">For a customer who called or walked in.</p>
      </div>
      <Card>
        <CardBody className="py-6">
          <StaffBookingForm services={services} />
        </CardBody>
      </Card>
    </div>
  );
}
