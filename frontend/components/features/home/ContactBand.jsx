import { ArrowUpRight, CalendarCheck, Clock, MapPin, Navigation, Phone, Siren, Truck } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getSite } from "@/lib/api/content";
import { SITE } from "@/lib/constants";
import { WorkshopMap3D } from "./WorkshopMap3D";

// Exact coordinates of the owner-marked plot (SITE.geo) rather than a name search.
const LAT_LNG = `${SITE.geo.lat},${SITE.geo.lng}`;
const MAP_EMBED = `https://maps.google.com/maps?q=${LAT_LNG}&z=17&output=embed`;
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${LAT_LNG}`;

/** Emergency and Pick & Drop targets come from the "quick buttons" settings (D8). */
const quickActions = (site) => [
  {
    href: site.quickButtons.emergencyHref,
    icon: Siren,
    title: "Emergency help",
    text: "Breakdown? Call us now",
  },
  {
    href: site.quickButtons.pickDropHref,
    external: true,
    icon: Truck,
    title: "Pick & Drop",
    text: "Arrange on WhatsApp",
  },
];

/**
 * Home, last section: dark glass "book today" panel (big call number, book /
 * WhatsApp, Emergency and Pick & Drop — decision D8: they just call or
 * WhatsApp) beside a 3D map with a floating hours + address card.
 */
export async function ContactBand() {
  const site = await getSite();

  return (
    <section aria-labelledby="contact-band-heading">
      <Container className="py-10 2xl:py-15">
        <div className="relative grid overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-900/60 shadow-2xl shadow-black/50 backdrop-blur-sm lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Red light line along the top edge. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 z-10 h-px bg-[linear-gradient(to_right,transparent,var(--color-brand-500)_30%,var(--color-brand-500)_70%,transparent)]"
          />

          {/* Call to action */}
          <div className="relative isolate overflow-hidden p-8 sm:p-10 lg:p-12">
            <div
              aria-hidden="true"
              className="absolute -top-32 -left-32 -z-10 size-96 rounded-full bg-brand-600/30 blur-[100px]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[repeating-linear-gradient(135deg,transparent_0_22px,rgb(255_255_255/0.025)_22px_23px)] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
            />

            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-600/10 px-3 py-1 text-xs font-semibold tracking-widest text-brand-500 uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-brand-500" aria-hidden="true" />
              Ready when you are
            </p>
            <h2
              id="contact-band-heading"
              className="mt-5 font-display text-4xl leading-[1.05] font-medium text-white sm:text-5xl"
            >
              Book your service <span className="text-brand-500">today</span>
            </h2>
            <p className="mt-4 max-w-md text-zinc-400">
              Tell us what your car needs — we&apos;ll give you a slot, a clear quote and your car back on time.
            </p>

            {/* Big call number */}
            <a href={site.phoneHref} className="group mt-8 flex items-center gap-4">
              <span className="relative flex size-14 shrink-0 items-center justify-center">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 animate-ping rounded-full bg-brand-600/30 [animation-duration:2.2s]"
                />
                <span className="relative flex size-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-900/60 transition-transform group-hover:scale-105">
                  <Phone className="size-6" aria-hidden="true" />
                </span>
              </span>
              <span>
                <span className="block text-xs font-semibold tracking-widest text-zinc-500 uppercase">Call us now</span>
                <span className="block font-display text-3xl font-medium text-white transition-colors group-hover:text-brand-500 sm:text-4xl">
                  {site.phone}
                </span>
              </span>
            </a>
            {site.hotline && (
              <p className="mt-3 pl-[4.5rem] text-sm text-zinc-400">
                Hotline:{" "}
                <a href={site.hotlineHref} className="font-semibold text-white hover:text-brand-500">
                  {site.hotline}
                </a>
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#appointment" size="lg" className="shadow-lg shadow-brand-900/50">
                <CalendarCheck aria-hidden="true" />
                Book Appointment
              </Button>
              <Button
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                variant="outline-light"
              >
                <WhatsAppIcon className="text-[#25D366]" />
                WhatsApp
              </Button>
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
              {quickActions(site).map(({ href, external, icon: Icon, title, text }) => (
                <li key={title}>
                  <a
                    href={href}
                    {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                    className="group flex h-full items-center gap-3 rounded-card border border-white/10 bg-surface p-4 transition duration-300 hover:-translate-y-0.5 hover:border-brand-500/50 hover:bg-brand-600/10"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600/15 text-brand-500 ring-1 ring-brand-500/30 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-white">{title}</span>
                      <span className="block text-sm text-zinc-400">{text}</span>
                    </span>
                    <ArrowUpRight
                      className="size-4 shrink-0 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-500"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3D map; the info card floats on it from sm up and sits below it on phones. */}
          <div className="relative flex flex-col border-t border-white/10 sm:min-h-[460px] lg:min-h-[560px] lg:border-t-0 lg:border-l">
            <WorkshopMap3D fallbackSrc={MAP_EMBED} className="h-[340px] w-full sm:absolute sm:inset-0 sm:h-full" />

            <div className="relative m-4 rounded-card border border-white/10 bg-ink-950/85 p-5 shadow-2xl shadow-black/60 backdrop-blur-md sm:absolute sm:bottom-6 sm:left-6 sm:m-0 sm:w-[22rem]">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
                <div>
                  <p className="font-bold text-white">Visit the workshop</p>
                  <address className="mt-1 text-sm text-zinc-400 not-italic">{site.address}</address>
                </div>
              </div>
              <div className="mt-4 flex gap-3 border-t border-white/10 pt-4">
                <Clock className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
                <dl className="grid flex-1 gap-1 text-sm">
                  {site.openingHours.map((row) => (
                    <div key={row.days} className="flex justify-between gap-3">
                      <dt className="text-zinc-400">{row.days}</dt>
                      <dd className="font-semibold text-white">{row.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <Button href={DIRECTIONS} target="_blank" rel="noopener noreferrer" className="mt-4 w-full">
                <Navigation aria-hidden="true" />
                Get directions
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
