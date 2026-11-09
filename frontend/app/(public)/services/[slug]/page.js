import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock,
  Phone,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { ContactBand } from "@/components/features/home/ContactBand";
import { ServiceCard } from "@/components/features/services/ServiceCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/constants";
import { HOME_SERVICES } from "@/lib/home-content";
import { SERVICE_DETAILS } from "@/lib/service-details";

const PROMISES = ["Clear quote before any work", "Genuine parts & Shell Helix oils", "Certified technicians"];

function getService(slug) {
  const service = HOME_SERVICES.find((item) => item.slug === slug);
  const detail = SERVICE_DETAILS[slug];
  return service && detail ? { ...service, ...detail } : null;
}

export function generateStaticParams() {
  return HOME_SERVICES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: `${service.name} in Dhaka`,
    description: service.intro,
    alternates: { canonical: `/services/${slug}` },
    openGraph: { images: [service.photo.src] },
  };
}

/** Service detail (Step 5 §6.3): hero, what's included, signs, FAQ, related services, CTA band. */
export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = HOME_SERVICES.filter((item) => item.slug !== slug).slice(0, 3);
  const bookHref = `/#book-${slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      description: service.intro,
      serviceType: service.name,
      areaServed: { "@type": "City", name: "Dhaka" },
      provider: {
        "@type": "AutoRepair",
        name: SITE.name,
        telephone: [SITE.phone, SITE.hotline],
        address: SITE.address,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: service.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Services", item: `${SITE.url}/services` },
        { "@type": "ListItem", position: 3, name: service.name },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // Static content from our own code, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero: text left, photo right */}
      <section className="relative isolate overflow-hidden pt-32 pb-10 lg:pt-36 2xl:pb-15">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_80%_at_80%_0%,rgb(162_34_31/0.35),transparent_70%)]"
        />
        <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-400">
                <li className="flex items-center gap-1.5">
                  <Link href="/" className="hover:text-brand-500">
                    Home
                  </Link>
                  <ChevronRight className="size-3.5 text-zinc-600" aria-hidden="true" />
                </li>
                <li className="flex items-center gap-1.5">
                  <Link href="/services" className="hover:text-brand-500">
                    Services
                  </Link>
                  <ChevronRight className="size-3.5 text-zinc-600" aria-hidden="true" />
                </li>
                <li aria-current="page" className="text-zinc-200">
                  {service.name}
                </li>
              </ol>
            </nav>

            <p className="mt-8 text-sm font-semibold tracking-widest text-brand-500 uppercase">{service.name}</p>
            <h1 className="mt-2 font-display text-4xl leading-[1.05] font-medium text-white sm:text-5xl">
              {service.headline}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-zinc-400">{service.intro}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={bookHref} size="lg" className="shadow-lg shadow-brand-900/50">
                <CalendarCheck aria-hidden="true" />
                Book this service
              </Button>
              <Button href={SITE.phoneHref} size="lg" variant="outline-light">
                <Phone aria-hidden="true" />
                {SITE.phone}
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <Clock className="size-4 text-brand-500" aria-hidden="true" />
                Usually {service.duration}
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-brand-500" aria-hidden="true" />
                Price agreed before work
              </li>
            </ul>
          </div>

          {/* Our own portrait workshop stills — portrait frame so little is cropped. */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[1.5rem] shadow-2xl ring-1 shadow-black/60 ring-white/15 lg:mr-0 2xl:max-w-lg">
            <Image
              src={service.photo.src}
              alt={service.photo.alt}
              fill
              priority
              quality={90}
              sizes="(min-width: 1536px) 512px, (min-width: 640px) 448px, 100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent" />
          </div>
        </Container>
      </section>

      {/* What's included + when to come in */}
      <section aria-labelledby="included-heading">
        <Container className="grid grid-cols-1 items-start gap-6 py-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] 2xl:py-15">
          <div className="rounded-card border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
            <h2 id="included-heading" className="font-display text-3xl font-medium text-white">
              What&apos;s <span className="text-brand-500">included</span>
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {service.included.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-card border border-brand-500/30 bg-brand-600/[0.07] p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <AlertTriangle className="size-5 text-brand-500" aria-hidden="true" />
                Time to come in if…
              </h2>
              <ul className="mt-4 space-y-2.5">
                {service.signs.map((sign) => (
                  <li key={sign} className="flex gap-2.5 text-sm text-zinc-300">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                    {sign}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-card border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white">The Jayma promise</h2>
              <ul className="mt-4 space-y-2.5">
                {PROMISES.map((promise) => (
                  <li key={promise} className="flex gap-2.5 text-sm text-zinc-300">
                    <ShieldCheck className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
                    {promise}
                  </li>
                ))}
              </ul>
              <Button
                href={SITE.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline-light"
                // Wraps on very small phones instead of pushing the card wider.
                className="mt-6 h-auto min-h-11 w-full py-2.5 text-center whitespace-normal"
              >
                <WhatsAppIcon className="text-[#25D366]" />
                Ask a question on WhatsApp
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section aria-labelledby="service-faq-heading">
        <Container className="py-10 2xl:py-15">
          <h2 id="service-faq-heading" className="font-display text-3xl font-medium text-white sm:text-4xl">
            Common <span className="text-brand-500">questions</span>
          </h2>
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {service.faqs.map((faq) => (
              <details
                key={faq.q}
                className="group h-fit rounded-card border border-white/10 bg-white/[0.03] backdrop-blur-sm open:border-brand-500/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-white sm:p-6 [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-brand-500 transition duration-300 group-open:rotate-45 group-open:border-brand-500 group-open:bg-brand-600 group-open:text-white">
                    <Plus className="size-4" aria-hidden="true" />
                  </span>
                </summary>
                <p className="-mt-1 px-5 pb-5 leading-relaxed text-zinc-400 sm:px-6 sm:pb-6">{faq.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* Related services */}
      <section aria-labelledby="related-heading">
        <Container className="py-10 2xl:py-15">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="related-heading" className="font-display text-3xl font-medium text-white sm:text-4xl">
              Other <span className="text-brand-500">services</span>
            </h2>
            <Button href="/services" variant="outline-light" className="self-start sm:self-auto">
              View all services
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, i) => (
              // Third card only where it fits the row (phone list and 3-column laptops).
              <li key={item.slug} className={i === 2 ? "sm:max-lg:hidden" : undefined}>
                <ServiceCard service={item} headingLevel="h3" />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <ContactBand />
    </>
  );
}
