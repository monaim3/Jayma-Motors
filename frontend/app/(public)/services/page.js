import { MessageCircleQuestion, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { ContactBand } from "@/components/features/home/ContactBand";
import { HowItWorksSection } from "@/components/features/home/HowItWorksSection";
import { ServiceCard } from "@/components/features/services/ServiceCard";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getServices, getSite } from "@/lib/api/content";

export const metadata = {
  title: "Car Services in Dhaka",
  description:
    "Engine & brake servicing, computerized diagnosis, denting, painting, wheel alignment, battery replacement and routine maintenance for all car brands — Jayma Motors, Vatara, Dhaka.",
  alternates: { canonical: "/services" },
};

/**
 * Services list (Step 5 §6.3). Services and contact details come from Laravel
 * (GET /services, /settings/public), with the built-in copy as a fallback.
 */
export default async function ServicesPage() {
  const [services, site] = await Promise.all([getServices(), getSite()]);

  return (
    <>
      <PageHero
        eyebrow="Our services"
        title={
          <>
            Everything your car needs, <span className="text-brand-500">under one roof</span>
          </>
        }
        intro="From a quick scan to a full repaint — certified technicians, genuine parts and a clear price before we start. All major Japanese, Korean and European brands."
        crumbs={[{ label: "Services" }]}
      />

      <section aria-label="All services">
        <Container className="pb-10 2xl:pb-15">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <li key={service.slug}>
                <ServiceCard service={service} priority={index < 3} />
              </li>
            ))}

            {/* Fills the last grid slot (full width when alone in the 2-column tablet grid): for jobs not listed above. */}
            <li className={services.length % 2 === 0 ? "sm:max-lg:col-span-2" : undefined}>
              <div className="flex h-full flex-col justify-center rounded-card border border-dashed border-brand-500/40 bg-brand-600/[0.06] p-8">
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-600/15 text-brand-500 ring-1 ring-brand-500/30">
                  <MessageCircleQuestion className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-display text-2xl font-medium text-white">Don&apos;t see your problem?</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Strange noise, warning light or something else? Tell us what&apos;s happening — we&apos;ll diagnose it
                  and give you a clear quote.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href={site.phoneHref} size="sm">
                    <Phone aria-hidden="true" />
                    Call us
                  </Button>
                  <Button
                    href={site.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline-light"
                    size="sm"
                  >
                    <WhatsAppIcon className="text-[#25D366]" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </li>
          </ul>
        </Container>
      </section>

      <HowItWorksSection />
      <ContactBand />
    </>
  );
}
