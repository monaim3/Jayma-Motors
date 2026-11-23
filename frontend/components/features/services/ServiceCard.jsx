import { ArrowRight, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SITE } from "@/lib/constants";
import { servicePoster } from "@/lib/service-posters";
import { ServiceIcon } from "./service-icons";

/**
 * Services list card. Top: a workshop-ad style poster (owner's reference,
 * cardoctorltd.com) — the service photo with a red brand shape, a bold
 * two-line headline, the logo and a contact strip, all drawn by the site so
 * the text stays sharp. Below: icon, name, short text, "Learn more" (whole
 * card opens the service page) and "Book now" (home booking form, service preselected).
 * The photo is the one set in the admin panel (old stock photo only as a fallback).
 */
export function ServiceCard({ service, priority = false, headingLevel = "h2" }) {
  const Heading = headingLevel;
  const poster = servicePoster(service);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-white/10 bg-surface backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-2xl hover:shadow-brand-900/30">
      <div aria-hidden="true" className="relative isolate aspect-square overflow-hidden @container">
        <Image
          src={service.photo?.src ?? `/images/services/${service.slug}.jpg`}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          style={{ objectPosition: poster.focus }}
          className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/70 via-transparent to-ink-950/25" />

        {/*
          Brand shape: a see-through red disc in the top-right corner, solid only
          behind the headline and fading out toward the photo, so the person
          doing the job stays visible (owner, 2026-11-23).
        */}
        <div className="absolute -top-[24%] -right-[22%] -z-10 size-[70%] rounded-full bg-gradient-to-bl from-brand-600/90 via-brand-600/55 to-brand-700/10 shadow-[0_0_0_8px_rgb(255_255_255/0.08)] transition-transform duration-500 ease-out group-hover:scale-105" />

        <p className="absolute top-[9%] right-[6%] text-right font-poster whitespace-nowrap leading-[0.95] text-white uppercase drop-shadow-[0_2px_6px_rgb(0_0_0/0.35)]">
          <span className="block text-[9cqw]">{poster.top}</span>
          {poster.bottom && (
            <span className="mt-[2cqw] inline-block bg-white px-[2cqw] py-[1cqw] text-[7cqw] text-brand-700">
              {poster.bottom}
            </span>
          )}
        </p>

        <span className="absolute top-[5%] left-[5%] rounded-md bg-ink-950/55 px-2 py-1.5 backdrop-blur-sm">
          <Logo variant="white" href={null} className="h-[7cqw] max-h-8" sizes="90px" />
        </span>

        {/* Contact strip, as on a workshop ad. */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-[2cqw] bg-ink-950/90 px-[4cqw] py-[2.8cqw] text-[3cqw] leading-none font-semibold whitespace-nowrap text-white">
          <span className="inline-flex items-center gap-[1.5cqw]">
            <Phone className="size-[3.4cqw] text-brand-500" />
            {SITE.phone}
          </span>
          <span className="text-brand-500 uppercase">Bangladesh&apos;s biggest workshop</span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-6">
        <Heading className="flex items-center gap-3 text-xl font-bold text-white">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-900/50">
            <ServiceIcon name={service.icon} className="size-5" />
          </span>
          {/* Stretched link: the whole card opens the service page. */}
          <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0">
            {service.name}
          </Link>
        </Heading>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{service.text}</p>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-300 transition-colors group-hover:text-white">
            Learn more
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
          {/* Sits above the stretched link. */}
          <Link
            href={`/#book-${service.slug}`}
            aria-label={`Book ${service.name}`}
            className="relative z-10 rounded-control bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Book now
          </Link>
        </div>
      </div>
    </article>
  );
}
