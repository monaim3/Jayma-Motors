import { Logo } from "@/components/brand/Logo";
import { SITE } from "@/lib/constants";

export const metadata = {
  robots: { index: false },
};

/**
 * Split screen: brand panel (desktop) + form (Step 5 §4.2). The brand panel is
 * centred and stays in place (sticky) while a long form scrolls.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col items-center justify-center overflow-hidden bg-ink-950 p-12 text-center text-white lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,var(--color-brand-900),transparent_60%)] opacity-80"
        />
        <div className="relative flex max-w-lg flex-col items-center">
          <Logo variant="white" className="h-20" />
          <p className="mt-10 font-display text-4xl leading-snug font-medium text-white xl:text-5xl">{SITE.tagline}</p>
          <span aria-hidden="true" className="mt-6 h-px w-16 bg-brand-500" />
          <p lang="bn" className="mt-6 text-lg leading-relaxed text-zinc-300">
            {SITE.taglineBn}
          </p>
        </div>
      </aside>

      <main className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <Logo className="mb-8 h-14 lg:hidden" />
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
