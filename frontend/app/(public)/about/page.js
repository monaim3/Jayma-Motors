import { Gem, HandHeart, ShieldCheck, Wrench } from "lucide-react";
import Image from "next/image";
import { ContactBand } from "@/components/features/home/ContactBand";
import { StatsBand } from "@/components/features/home/StatsBand";
import { VideoShowcaseSection } from "@/components/features/home/VideoShowcaseSection";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getPage } from "@/lib/api/content";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "About Us",
  description: `Jayma Motors has cared for cars in Vatara, Dhaka since ${SITE.since} — a 60,000 sq ft multi-brand workshop with certified technicians, a paint booth and genuine Shell Helix oils.`,
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Honesty first",
    text: "We explain the problem and the price before we start — and only do the work you approve.",
  },
  {
    icon: Wrench,
    title: "Skilled hands",
    text: "Certified technicians and modern scan tools, for Japanese, Korean and European cars.",
  },
  {
    icon: Gem,
    title: "Genuine parts",
    text: "Authorized Shell Helix dealer. Sealed oils and quality parts — never diluted, never fake.",
  },
  {
    icon: HandHeart,
    title: "Care like it's ours",
    text: "Every car is handled with the same care we'd give our own, and handed back clean.",
  },
];

/** Stills from the owner's workshop video (assets-src/video). */
const WORKSHOP_PHOTOS = [
  { src: "/images/about/team.webp", caption: "Our team at work" },
  { src: "/images/about/engine.webp", caption: "Engine & diagnostics" },
  { src: "/images/about/paint-booth.webp", caption: "Dust-free paint booth" },
  { src: "/images/about/oil.webp", caption: "Genuine Shell Helix oils" },
];

/**
 * About Us (Step 5 §6.2). Story text is a DRAFT built from known facts
 * (since 2008, Vatara, 60,000 sq ft facility, multi-brand, Shell Helix dealer)
 * — owner to replace with the real story. Later editable via the pages API (F2).
 */
export default async function AboutPage() {
  // The story text is editable in the admin panel; the built-in copy shows if the API is down.
  const about = await getPage("about");

  return (
    <>
      <PageHero
        eyebrow="About us"
        title={
          <>
            Trusted care, done right — <span className="text-brand-500">since {SITE.since}</span>
          </>
        }
        intro="A multi-brand car workshop in Vatara, Dhaka, built on honest advice, skilled hands and genuine parts."
        crumbs={[{ label: "About" }]}
      />

      {/* Story */}
      <section aria-labelledby="story-heading">
        <Container className="grid items-center gap-10 py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 2xl:py-15">
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] shadow-2xl ring-1 shadow-black/60 ring-white/15">
              <Image
                src="/videos/why-jayma-poster.jpg"
                alt="Inside the Jayma Motors workshop: cars lined up under the steel roof"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[50%_65%]"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
            </div>
            {/* Floating facts */}
            <div className="absolute -right-3 bottom-8 rounded-card border border-white/10 bg-ink-950/90 px-5 py-4 shadow-2xl shadow-black/60 backdrop-blur sm:-right-8">
              <p className="font-display text-3xl font-medium text-white">
                60,000<span className="text-brand-500"> sq ft</span>
              </p>
              <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Workshop facility</p>
            </div>
            <div className="absolute top-8 -left-3 rounded-card bg-brand-600 px-5 py-4 text-white shadow-2xl shadow-brand-900/60 sm:-left-8">
              <p className="font-display text-3xl font-medium">{SITE.since}</p>
              <p className="text-xs font-semibold tracking-widest text-white/80 uppercase">Serving Dhaka since</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">Our story</p>
            <h2
              id="story-heading"
              className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl"
            >
              Built on trust in <span className="text-brand-500">Vatara</span>
            </h2>
            {about ? (
              <div
                className="mt-6 space-y-4 leading-relaxed text-zinc-300 [&_a]:text-brand-500 [&_strong]:text-white"
                // Sanitised by Laravel (Purifier, "content" profile).
                dangerouslySetInnerHTML={{ __html: about.bodyHtml }}
              />
            ) : (
              <div className="mt-6 space-y-4 leading-relaxed text-zinc-300">
                <p>
                  Jayma Motors started in {SITE.since} with a simple idea: car owners in Dhaka deserve a workshop that
                  tells them the truth. Find the real fault, explain it clearly, agree the price — then fix it properly.
                </p>
                <p>
                  That idea grew into a 60,000 sq ft multi-brand workshop beside Evercare Hospital Road, with
                  computerized diagnosis, a dedicated paint booth and a team of certified technicians who work on
                  everything from daily commuters to luxury cars.
                </p>
                <p>
                  As an authorized Shell Helix dealer, we use only genuine, sealed oils — and we treat every car that
                  comes through our gate like our own.
                </p>
              </div>
            )}

            <blockquote lang="bn" className="mt-8 border-l-2 border-brand-600 pl-5 text-lg leading-relaxed text-white">
              {SITE.taglineBn}
            </blockquote>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/services">Our services</Button>
              <Button href="/contact" variant="outline-light">
                Visit the workshop
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <StatsBand />

      {/* Values */}
      <section aria-labelledby="values-heading">
        <Container className="py-10 2xl:py-15">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">What we stand for</p>
            <h2
              id="values-heading"
              className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl"
            >
              Our <span className="text-brand-500">values</span>
            </h2>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="group rounded-card border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-500/40"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-600/15 text-brand-500 ring-1 ring-brand-500/30 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Inside the workshop */}
      <section aria-labelledby="inside-heading">
        <Container className="py-10 2xl:py-15">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">Our workshop</p>
            <h2
              id="inside-heading"
              className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl"
            >
              Where the <span className="text-brand-500">work happens</span>
            </h2>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {WORKSHOP_PHOTOS.map((photo) => (
              <li key={photo.src}>
                <figure className="group relative aspect-[3/4] overflow-hidden rounded-card ring-1 ring-white/10">
                  <Image
                    src={photo.src}
                    alt={photo.caption}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-bold text-white sm:text-base">
                    {photo.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <VideoShowcaseSection />
      <ContactBand />
    </>
  );
}
