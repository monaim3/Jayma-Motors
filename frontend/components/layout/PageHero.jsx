import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/constants";

/**
 * Inner-page header (Step 5 §6.2): eyebrow, big title, intro and breadcrumb,
 * on the dark page background with a red glow. Clears the fixed header.
 * Also outputs BreadcrumbList structured data.
 *
 * @param crumbs - [{ label, href? }] after Home; the last one is the current page.
 * @param aside - optional panel shown beside the text on laptops (below on phones).
 * @param children - optional extra content under the intro (e.g. buttons).
 */
export function PageHero({ eyebrow, title, intro, crumbs = [], aside, children }) {
  const trail = [{ label: "Home", href: "/" }, ...crumbs];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href && { item: new URL(item.href, SITE.url).toString() }),
    })),
  };

  return (
    <section className="relative isolate overflow-hidden pt-32 pb-10 lg:pt-40 2xl:pb-15">
      <script
        type="application/ld+json"
        // Static content from our own code, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_80%_at_80%_0%,rgb(162_34_31/0.35),transparent_70%)]"
      />
      <Container
        className={aside ? "grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16" : undefined}
      >
        <div>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-400">
              {trail.map((item, index) => {
                const last = index === trail.length - 1;
                return (
                  <li key={item.label} className="flex items-center gap-1.5">
                    {last ? (
                      <span aria-current="page" className="text-zinc-200">
                        {item.label}
                      </span>
                    ) : (
                      <Link href={item.href} className="transition-colors hover:text-brand-500">
                        {item.label}
                      </Link>
                    )}
                    {!last && <ChevronRight className="size-3.5 text-zinc-600" aria-hidden="true" />}
                  </li>
                );
              })}
            </ol>
          </nav>

          {eyebrow && <p className="mt-8 text-sm font-semibold tracking-widest text-brand-500 uppercase">{eyebrow}</p>}
          <h1 className="mt-2 max-w-3xl font-display text-4xl leading-[1.05] font-medium text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">{intro}</p>}
          {children}
        </div>
        {aside}
      </Container>
    </section>
  );
}
