import { ArrowRight, BatteryCharging, CircleDot, ClipboardCheck, Cog, Cpu, Hammer, PaintRoller, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ICONS = { BatteryCharging, CircleDot, ClipboardCheck, Cog, Cpu, Hammer, PaintRoller, Wrench };

/**
 * Services list card: photo, icon, name, short text, "Learn more" (whole card
 * opens the service page) and "Book now" (home booking form, service preselected).
 */
export function ServiceCard({ service, priority = false, headingLevel = "h2" }) {
  const Heading = headingLevel;
  const Icon = ICONS[service.icon] ?? Wrench;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-white/10 bg-white/[0.03] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-2xl hover:shadow-brand-900/30">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={`/images/services/${service.slug}.jpg`}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
      </div>

      <div className="relative flex flex-1 flex-col p-6 pt-10">
        {/* Outside the photo box (which clips), overlapping its bottom edge. */}
        <span className="absolute -top-6 left-6 flex size-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg ring-4 shadow-brand-900/50 ring-ink-950">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <Heading className="text-xl font-bold text-white">
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
