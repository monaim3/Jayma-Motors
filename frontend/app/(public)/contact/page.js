import { ArrowUpRight, Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { FacebookIcon } from "@/components/brand/FacebookIcon";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { ContactForm } from "@/components/features/contact/ContactForm";
import { FaqSection } from "@/components/features/home/FaqSection";
import { WorkshopMap3D } from "@/components/features/home/WorkshopMap3D";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getSite } from "@/lib/api/content";
import { SITE } from "@/lib/constants";

export async function generateMetadata() {
  const site = await getSite();
  const numbers = [site.phone, site.hotline].filter(Boolean).join(" or ");
  return {
    title: "Contact Us",
    description: `Call ${numbers}, WhatsApp or visit ${site.name} in Vatara, Dhaka. Book a service or send an enquiry online.`,
    alternates: { canonical: "/contact" },
  };
}

const LAT_LNG = `${SITE.geo.lat},${SITE.geo.lng}`;
const MAP_EMBED = `https://maps.google.com/maps?q=${LAT_LNG}&z=17&output=embed`;
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${LAT_LNG}`;

/** WhatsApp, email and Facebook cards (Facebook only when a link is set in Settings). */
const channels = (site) =>
  [
    {
      icon: WhatsAppIcon,
      label: "WhatsApp",
      value: site.whatsapp,
      href: site.whatsappHref,
      external: true,
      note: "Send photos of the problem",
      iconClass: "text-[#25D366]",
    },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}`, note: "For quotes and documents" },
    site.social.facebook && {
      icon: FacebookIcon,
      label: "Facebook",
      value: site.name,
      href: site.social.facebook,
      external: true,
      note: "Latest work & offers",
    },
  ].filter(Boolean);

/**
 * Contact (Step 5 §6.10): contact cards, message form (owner request
 * 2026-11-09, replacing decision U6), hours, address and the 3D map, FAQ.
 */
export default async function ContactPage() {
  const site = await getSite();

  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title={
          <>
            We&apos;re here to <span className="text-brand-500">help</span>
          </>
        }
        intro="Call, WhatsApp or drop by the workshop in Vatara. Open every day — bring your car in or book a slot online."
        crumbs={[{ label: "Contact" }]}
      />

      {/* Ways to reach us */}
      <section aria-labelledby="channels-heading">
        <h2 id="channels-heading" className="sr-only">
          Ways to reach us
        </h2>
        <Container className="pb-10 2xl:pb-15">
          {/* 4 across only from xl: at 1024 the email address would break mid-word. */}
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Two numbers, so the call card holds two links instead of being one. */}
            <li>
              <div className="group relative flex h-full flex-col rounded-card border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:bg-white/[0.05]">
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-600/15 text-brand-500 ring-1 ring-brand-500/30 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Phone className="size-5" aria-hidden="true" />
                </span>
                <span className="mt-5 text-xs font-semibold tracking-widest text-zinc-500 uppercase">Call us</span>
                <a href={site.phoneHref} className="mt-1 text-lg font-bold text-white hover:text-brand-500">
                  {site.phone}
                </a>
                {site.hotline && (
                  <a href={site.hotlineHref} className="text-lg font-bold text-white hover:text-brand-500">
                    {site.hotline} <span className="text-sm font-semibold text-zinc-500">hotline</span>
                  </a>
                )}
                <span className="mt-1 text-sm text-zinc-400">Fastest for bookings &amp; emergencies</span>
              </div>
            </li>
            {channels(site).map(({ icon: Icon, label, value, href, external, note, iconClass }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                  className="group flex h-full flex-col rounded-card border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:bg-white/[0.05]"
                >
                  <span className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-full bg-brand-600/15 text-brand-500 ring-1 ring-brand-500/30 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <Icon className={`size-5 ${iconClass ?? ""}`} aria-hidden="true" />
                    </span>
                    <ArrowUpRight
                      className="size-5 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-500"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-5 text-xs font-semibold tracking-widest text-zinc-500 uppercase">{label}</span>
                  <span className="mt-1 text-lg font-bold break-all text-white">{value}</span>
                  <span className="mt-1 text-sm text-zinc-400">{note}</span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Message form */}
      <section aria-labelledby="message-heading">
        <Container className="py-10 2xl:py-15">
          <div className="grid gap-8 rounded-[1.75rem] border border-white/10 bg-ink-900/60 p-6 shadow-2xl shadow-black/50 backdrop-blur-sm sm:p-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
            <div>
              <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">Write to us</p>
              <h2 id="message-heading" className="mt-2 font-display text-3xl font-medium text-white sm:text-4xl">
                Send us a <span className="text-brand-500">message</span>
              </h2>
              <p className="mt-4 text-zinc-400">
                Questions, a price check or feedback — leave a message and our team will call or email you back.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                {[
                  "Reply within a few hours",
                  "No spam — we only contact you about your message",
                  "Prefer to talk? Call or WhatsApp any time",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <ContactForm phone={site.phone} />
          </div>
        </Container>
      </section>

      {/* Visit: address + hours + map */}
      <section aria-labelledby="visit-heading">
        <Container className="py-10 2xl:py-15">
          <div className="grid overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-900/60 shadow-2xl shadow-black/50 backdrop-blur-sm lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="flex flex-col gap-8 p-8 sm:p-10">
              <div>
                <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">Visit the workshop</p>
                <h2 id="visit-heading" className="mt-2 font-display text-3xl font-medium text-white sm:text-4xl">
                  Find us in <span className="text-brand-500">Vatara</span>
                </h2>
              </div>

              <div className="flex gap-4">
                <MapPin className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
                <div>
                  <p className="font-bold text-white">Address</p>
                  <address className="mt-1 text-zinc-400 not-italic">{site.address}</address>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-bold text-white">Opening hours</p>
                  <dl className="mt-1 space-y-1">
                    {site.openingHours.map((row) => (
                      <div key={row.days} className="flex justify-between gap-4 text-zinc-400">
                        <dt>{row.days}</dt>
                        <dd className="font-semibold text-white">{row.time}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <Button href={DIRECTIONS} target="_blank" rel="noopener noreferrer" size="lg" className="self-start">
                <Navigation aria-hidden="true" />
                Get directions
              </Button>
            </div>

            <div className="relative min-h-[380px] border-t border-white/10 lg:min-h-[520px] lg:border-t-0 lg:border-l">
              <WorkshopMap3D fallbackSrc={MAP_EMBED} className="absolute inset-0 size-full" />
            </div>
          </div>
        </Container>
      </section>

      <FaqSection />
    </>
  );
}
