import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { BOOKING_HREF } from "@/lib/constants";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-16 text-center">
      <Logo className="h-14" />
      <p className="mt-10 text-sm font-semibold tracking-widest text-brand-600 uppercase">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 max-w-md text-zinc-600">The page you are looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/">Go to Home</Button>
        <Button href="/services" variant="outline">
          Our Services
        </Button>
        <Button href={BOOKING_HREF} variant="outline">
          Book Appointment
        </Button>
      </div>
    </main>
  );
}
