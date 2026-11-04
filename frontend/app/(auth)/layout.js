import { Logo } from "@/components/brand/Logo";
import { SITE } from "@/lib/constants";

export const metadata = {
  robots: { index: false },
};

/** Split screen: brand panel (desktop) + form (Step 5 §4.2). */
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink-950 p-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,var(--color-brand-900),transparent_60%)] opacity-80"
        />
        <Logo variant="white" className="relative h-16" />
        <div className="relative">
          <p className="font-display text-4xl leading-snug font-medium text-white">{SITE.tagline}</p>
          <p lang="bn" className="mt-4 text-zinc-300">
            {SITE.taglineBn}
          </p>
        </div>
      </aside>

      <main className="flex flex-col items-center justify-center px-4 py-12 sm:px-8">
        <Logo className="mb-8 h-14 lg:hidden" />
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
