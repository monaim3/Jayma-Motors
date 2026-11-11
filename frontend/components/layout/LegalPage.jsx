import { Mail, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { getSite } from "@/lib/api/content";

/**
 * Shared layout for Terms and Privacy: hero, "on this page" contents list
 * (sticky on laptops) and readable numbered sections.
 *
 * @param sections - [{ id, title, body: ReactNode }] (built-in copy) or
 *   [{ id, title, html }] (from the pages API; already sanitised by Laravel)
 */
export async function LegalPage({ title, intro, updated, crumb, sections }) {
  const site = await getSite();

  return (
    <>
      <PageHero eyebrow="Legal" title={title} intro={intro} crumbs={[{ label: crumb }]} />
      <Container className="grid gap-10 pb-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16 2xl:pb-15">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm text-zinc-500">Last updated: {updated}</p>
          <nav aria-label="On this page" className="mt-4 rounded-card border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">On this page</p>
            <ol className="mt-3 space-y-2 text-sm">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex gap-2 text-zinc-300 transition-colors hover:text-brand-500"
                  >
                    <span className="text-zinc-600 tabular-nums">{index + 1}.</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="max-w-3xl">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 border-b border-white/10 py-8 first:pt-0 last:border-0"
            >
              <h2 className="font-display text-2xl font-medium text-white sm:text-3xl">
                <span className="mr-2 text-brand-500 tabular-nums">{index + 1}.</span>
                {section.title}
              </h2>
              <div className="mt-4 space-y-3 leading-relaxed text-zinc-300 [&_a]:text-brand-500 [&_a]:underline-offset-4 [&_a:hover]:underline [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:text-white [&_ul]:space-y-1.5">
                {section.html ? (
                  <div className="space-y-3" dangerouslySetInnerHTML={{ __html: section.html }} />
                ) : (
                  section.body
                )}
              </div>
            </section>
          ))}

          <div className="mt-6 rounded-card border border-brand-500/30 bg-brand-600/[0.07] p-6">
            <p className="font-bold text-white">Questions about this page?</p>
            <p className="mt-1 text-sm text-zinc-400">Contact {site.name} — we&apos;re happy to help.</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a href={site.phoneHref} className="inline-flex items-center gap-2 text-white hover:text-brand-500">
                <Phone className="size-4 text-brand-500" aria-hidden="true" />
                {site.phone}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-2 text-white hover:text-brand-500"
              >
                <Mail className="size-4 text-brand-500" aria-hidden="true" />
                {site.email}
              </a>
            </div>
          </div>
        </article>
      </Container>
    </>
  );
}
