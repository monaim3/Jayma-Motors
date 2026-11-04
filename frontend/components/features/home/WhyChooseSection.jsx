import { BadgeCheck, Droplets, ReceiptText, ScanLine } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { WHY_POINTS } from "@/lib/home-content";

const ICONS = { BadgeCheck, Droplets, ReceiptText, ScanLine };

/** Home: reasons to choose Jayma (the workshop video has its own section below). */
export function WhyChooseSection() {
  return (
    <section aria-labelledby="why-heading">
      <Container className="py-10 2xl:py-15">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">Why choose Jayma</p>
            <h2
              id="why-heading"
              className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl"
            >
              Trusted care, done right — <span className="text-brand-500">since 2012</span>
            </h2>
          </div>
          <p className="max-w-xl text-zinc-400 lg:justify-self-end">
            Families and businesses across Dhaka trust Jayma Motors with their cars. Here&apos;s what makes the
            difference.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_POINTS.map((point) => {
            const Icon = ICONS[point.icon];
            return (
              <li
                key={point.title}
                className="group relative overflow-hidden rounded-card border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:bg-white/[0.05]"
              >
                <span className="relative flex size-12 items-center justify-center rounded-full bg-brand-600/15 text-brand-500 ring-1 ring-brand-500/30 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="relative mt-5 text-lg font-bold text-white">{point.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-zinc-400">{point.text}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
