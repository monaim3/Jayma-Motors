"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { servicePoster } from "@/lib/service-posters";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 4500;
const COPIES = 3; // [clone][real][clone] — the track always sits in the middle copy

/**
 * Home: infinite services carousel (owner's reference, 2026-11-14). Tall photo
 * cards with a thin inset frame, the name centred in capitals and a "Discover"
 * button; the whole card opens the service page. 3 cards on laptops, 2 on
 * tablets, ~1 on phones (swipe). The list is rendered three times and the
 * scroll position is silently moved back into the middle copy, so it never
 * ends. Moves on its own; pauses on hover, focus, touch and reduced motion.
 *
 * @param services - from the home page (GET /services): { slug, name, photo }
 */
export function ServicesSection({ services: items }) {
  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const [current, setCurrent] = useState(0);

  const services = items.map((service) => ({
    ...service,
    photo: service.photo ?? { src: `/images/services/${service.slug}.jpg`, alt: service.name },
  }));
  const count = services.length;

  /** Width of one card + gap, and of one full copy of the list. */
  const metrics = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length < count + 1) return null;
    const first = track.children[0].offsetLeft;
    return {
      track,
      card: track.children[1].offsetLeft - first,
      set: track.children[count].offsetLeft - first,
    };
  }, [count]);

  /** Jump (invisibly) back into the middle copy when the track drifts into a clone. */
  const recentre = useCallback(() => {
    const m = metrics();
    if (!m) return;
    const { track, set } = m;
    if (track.scrollLeft < set * 0.5) track.scrollLeft += set;
    else if (track.scrollLeft > set * 1.5) track.scrollLeft -= set;
  }, [metrics]);

  const update = useCallback(() => {
    const m = metrics();
    if (!m) return;
    const index = Math.round((m.track.scrollLeft - m.set) / m.card);
    setCurrent(((index % count) + count) % count);
  }, [metrics, count]);

  useEffect(() => {
    const track = trackRef.current;
    const m = metrics();
    if (!track || !m) return;
    track.scrollLeft = m.set; // start on the real first card

    let settle;
    const onScroll = () => {
      update();
      clearTimeout(settle);
      settle = setTimeout(recentre, 140); // after the scroll / snap has settled
    };
    const onResize = () => {
      recentre();
      update();
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(settle);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [metrics, recentre, update]);

  /** One card left or right — never runs out. */
  const step = useCallback(
    (direction) => {
      recentre();
      const m = metrics();
      m?.track.scrollBy({ left: direction * m.card, behavior: "smooth" });
    },
    [metrics, recentre],
  );

  /** Dots: go to a card in the middle copy. */
  const scrollTo = (index) => {
    const m = metrics();
    m?.track.scrollTo({ left: m.set + index * m.card, behavior: "smooth" });
  };

  // Autoplay, unless the visitor prefers reduced motion or is interacting.
  useEffect(() => {
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (!pausedRef.current && !document.hidden) step(1);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, step]);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  if (count === 0) return null;

  const loop = Array.from({ length: COPIES }, (_, copy) => services.map((service) => ({ service, copy }))).flat();

  const arrow =
    "hidden size-12 shrink-0 items-center justify-center self-center rounded-full border border-white/20 text-white transition duration-300 hover:border-brand-500 hover:bg-brand-600 lg:flex";

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

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Our services"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
          className="mt-10 flex gap-4 xl:gap-6 2xl:-mx-16"
        >
          <button type="button" onClick={() => step(-1)} aria-label="Previous services" className={arrow}>
            <ChevronLeft className="size-6" strokeWidth={1.5} aria-hidden="true" />
          </button>

          <ul
            ref={trackRef}
            className="-mx-4 flex min-w-0 flex-1 snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-5 overflow-x-auto px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {loop.map(({ service, copy }, index) => {
              const clone = copy !== 1;
              return (
                <li
                  key={`${copy}-${service.slug}`}
                  aria-hidden={clone || undefined}
                  className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
                >
                  <Link
                    href={`/services/${service.slug}`}
                    tabIndex={clone ? -1 : undefined}
                    aria-label={`${service.name} — discover`}
                    className="group relative isolate block aspect-[3/4] overflow-hidden bg-ink-900 lg:aspect-[2/3]"
                  >
                    <Image
                      src={service.photo.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 82vw"
                      style={{ objectPosition: servicePoster(service).focus }}
                      className="-z-20 object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    />
                    {/* Darkening for readable text; turns slightly red on hover. */}
                    {/* Lighter at the top so the photo reads; darker behind the name and button. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/10 via-ink-950/35 to-ink-950/55"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-900/70 via-brand-900/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />

                    {/* Thin inset frame that opens out slightly on hover. */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-5 border border-white/70 transition-all duration-500 group-hover:inset-3 group-hover:border-white sm:inset-7 sm:group-hover:inset-5"
                    />

                    <span className="absolute inset-x-9 top-1/2 -translate-y-1/2 text-center font-display text-[1.6rem] leading-tight font-medium tracking-wide [overflow-wrap:anywhere] text-white uppercase drop-shadow-[0_2px_12px_rgb(0_0_0/0.6)] sm:inset-x-11 sm:text-[1.85rem] lg:text-[1.6rem] xl:text-[1.85rem] 2xl:text-[2.1rem]">
                      {service.name}
                    </span>

                    <span className="absolute bottom-10 left-1/2 -translate-x-1/2 border border-white/80 px-7 py-3 text-xs font-semibold tracking-[0.25em] whitespace-nowrap text-white uppercase backdrop-blur-[2px] transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-ink-950 sm:bottom-12">
                      Discover
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <button type="button" onClick={() => step(1)} aria-label="Next services" className={arrow}>
            <ChevronRight className="size-6" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        {/* Phones & tablets: dots (swipe to move) */}
        <div className="mt-6 flex justify-center gap-1 lg:hidden">
          {services.map((service, index) => (
            <button
              key={service.slug}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Show ${service.name}`}
              aria-current={index === current}
              className="flex h-8 min-w-4 items-center justify-center"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  index === current ? "w-6 bg-brand-600" : "w-1.5 bg-white/25",
                )}
              />
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
