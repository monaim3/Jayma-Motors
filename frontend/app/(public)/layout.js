import { FloatingContact } from "@/components/layout/FloatingContact";
import { LedBackground } from "@/components/layout/LedBackground";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { getServices, getSite } from "@/lib/api/content";

// Fine film grain (SVG noise) for the site background.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Business details and services come from Laravel (cached; built-in copy if the API is down). */
export default async function PublicLayout({ children }) {
  const [site, services] = await Promise.all([getSite(), getServices()]);
  // The header only needs names and links; keep the browser payload small.
  const menuServices = services.map(({ slug, name }) => ({ slug, name }));

  return (
    <div className="relative isolate flex min-h-dvh flex-col bg-ink-950 text-zinc-300">
      {/*
        Site background (fixed behind every public section): deep black, soft
        logo-red glows, a faint workshop grid, red LED bars that light up only
        around the mouse, and film grain. Sections with their own backdrop (the hero) cover it.
      */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_88%_8%,rgb(93_21_20/0.6),transparent_70%),radial-gradient(ellipse_50%_40%_at_6%_92%,rgb(93_21_20/0.45),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_45%,black,transparent)] bg-[size:64px_64px]" />
        <LedBackground />
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      </div>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-white focus:px-4 focus:py-2 focus:text-ink-900 focus:shadow"
      >
        Skip to content
      </a>
      <PublicHeader site={site} services={menuServices} />
      <main id="main" className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <PublicFooter site={site} />
      <FloatingContact site={site} />
    </div>
  );
}
