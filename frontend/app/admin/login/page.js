import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { StaffLoginForm } from "@/components/features/auth/StaffLoginForm";

export const metadata = {
  title: "Management Login",
  robots: { index: false },
};

/** Staff login for the admin panel (Step 5 §4.4). Customers use /login. */
export default function AdminLoginPage() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ink-950 px-4 py-12">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_35%,var(--color-brand-900),transparent_60%)] opacity-70"
      />
      <Logo variant="white" preload className="h-16" />

      <div className="mt-8 w-full max-w-sm rounded-[1.25rem] bg-white p-7 shadow-2xl shadow-black/50 sm:p-8">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold tracking-wider text-brand-700 uppercase">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Staff only
        </p>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Management login</h1>
        <p className="mt-1 text-sm text-zinc-600">Sign in to manage bookings, customers and the website.</p>

        <div className="mt-6">
          <StaffLoginForm />
        </div>
      </div>

      <p className="mt-6 text-sm text-zinc-400">
        Customer?{" "}
        <Link href="/login" className="font-semibold text-white hover:text-brand-500">
          Log in here
        </Link>
        <span aria-hidden="true" className="mx-2 text-zinc-600">
          ·
        </span>
        <Link href="/" className="hover:text-white">
          Back to website
        </Link>
      </p>
    </main>
  );
}
