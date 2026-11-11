"use client";

import { ArrowRight, ArrowUpRight, CalendarCheck, Clock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { serviceIcon } from "@/components/features/services/service-icons";
import { cn } from "@/lib/utils";

/**
 * Home: services showcase (our own workshop photos).
 * Laptop — a list on the left; hovering/focusing a row opens its description
 * and crossfades the large photo panel on the right (sticky), which carries
 * the time estimate and Book / Details buttons.
 * Phone & tablet — a swipeable row of tall photo cards.
 *
 * @param services - from the home page (GET /services): { slug, name, icon, text, duration, photo }
 */
export function ServicesSection({ services: items }) {
  const [active, setActive] = useState(0);
  const services = items.map((service) => ({
    ...service,
    Icon: serviceIcon(service.icon),
    photo: service.photo ?? { src: `/images/services/${service.slug}.jpg`, alt: service.name },
  }));
  const current = services[Math.min(active, services.length - 1)];

  if (!current) return null;

  return (
    <section aria-labelledby="services-heading">
      <Container className="py-10 2xl:py-15">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">Our services</p>
            <h2
              id="services-heading"
              className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl"
            >
              Everything your car needs, <span className="text-brand-500">under one roof</span>
            </h2>
          </div>
          <Button href="/services" variant="outline-light" className="shrink-0 self-start sm:self-auto">
            View all services
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>

        {/* Laptop: interactive list + photo panel */}
        <div className="mt-10 hidden gap-10 lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] xl:gap-14">
          <ul className="flex flex-col gap-2">
            {services.map((service, i) => {
              const isActive = i === active;
              const { Icon } = service;
              return (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className={cn(
                      "group relative flex items-start gap-5 overflow-hidden rounded-card border px-5 py-4 transition-colors duration-300",
                      isActive
                        ? "border-brand-500/40 bg-gradient-to-r from-brand-600/15 to-white/[0.02]"
                        : "border-white/5 bg-white/[0.02] hover:border-white/15",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-y-3 left-0 w-1 rounded-r-full bg-brand-600 transition-transform duration-300",
                        isActive ? "scale-y-100" : "scale-y-0",
                      )}
                    />
                    <span
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-300",
                        isActive ? "bg-brand-600 text-white ring-brand-500" : "bg-white/5 text-brand-500 ring-white/10",
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 pt-2.5">
                      <span
                        className={cn(
                          "block text-lg font-bold transition-colors duration-300",
                          isActive ? "text-white" : "text-zinc-300",
                        )}
                      >
                        {service.name}
                      </span>
                      {/* Description opens on the active row (grid-rows trick animates height). */}
                      <span
                        className={cn(
                          "grid transition-[grid-template-rows,opacity] duration-300",
                          isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <span className="overflow-hidden">
                          <span className="block pt-1.5 text-sm leading-relaxed text-zinc-400">{service.text}</span>
                        </span>
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 flex size-9 shrink-0 items-center justify-center rounded-full border transition duration-300",
                        isActive
                          ? "rotate-0 border-brand-500 bg-brand-600 text-white"
                          : "-rotate-45 border-white/15 text-zinc-400",
                      )}
                    >
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="sticky top-28 self-start">
            <div className="relative aspect-[4/5] max-h-[calc(100dvh-9rem)] w-full overflow-hidden rounded-[1.5rem] shadow-2xl ring-1 shadow-black/60 ring-white/15">
              {services.map((service, i) => (
                <Image
                  key={service.slug}
                  src={service.photo.src}
                  alt={i === active ? service.photo.alt : ""}
                  fill
                  sizes="(min-width: 1280px) 480px, 40vw"
                  className={cn(
                    "object-cover transition-[opacity,transform] duration-700 ease-out",
                    i === active ? "scale-100 opacity-100" : "scale-105 opacity-0",
                  )}
                />
              ))}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"
              />

              <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-ink-950/70 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur">
                <ShieldCheck className="size-3.5 text-brand-500" aria-hidden="true" />
                Price agreed before work
              </span>

              <div className="absolute inset-x-0 bottom-0 p-6" aria-live="polite">
                <p key={current.slug} className="motion-safe:animate-[hero-fade_400ms_ease-out]">
                  <span className="block font-display text-3xl leading-tight font-medium text-white">
                    {current.name}
                  </span>
                  <span className="mt-2 flex items-center gap-1.5 text-sm text-zinc-300">
                    <Clock className="size-4 text-brand-500" aria-hidden="true" />
                    Usually {current.duration}
                  </span>
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button href={`#book-${current.slug}`} aria-label={`Book ${current.name}`}>
                    <CalendarCheck aria-hidden="true" />
                    Book now
                  </Button>
                  <Button
                    href={`/services/${current.slug}`}
                    variant="outline-light"
                    aria-label={`${current.name} details`}
                  >
                    Details
                    <ArrowUpRight aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phone & tablet: swipeable photo cards */}
        <ul className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden">
          {services.map((service) => {
            const { Icon } = service;
            return (
              <li key={service.slug} className="w-[78%] shrink-0 snap-start sm:w-[42%]">
                <article className="relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[1.25rem] ring-1 ring-white/10">
                  <Image
                    src={service.photo.src}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 42vw, 78vw"
                    className="-z-10 object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent"
                  />
                  <div className="p-5">
                    <span className="flex size-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-900/50">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 text-xl font-bold text-white">
                      <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0">
                        {service.name}
                      </Link>
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-300">{service.text}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                        <Clock className="size-3.5 text-brand-500" aria-hidden="true" />
                        {service.duration}
                      </span>
                      <a
                        href={`#book-${service.slug}`}
                        aria-label={`Book ${service.name}`}
                        className="relative z-10 rounded-control bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Book now
                      </a>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-center text-xs text-zinc-500 lg:hidden">Swipe to see all {services.length} services</p>
      </Container>
    </section>
  );
}
