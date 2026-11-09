import { ArrowRight, Check, Droplets } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SHELL_GRADES } from "@/lib/home-content";

const POINTS = [
  "Genuine, sealed Shell Helix oils — never refilled or diluted",
  "The right grade for your engine, as the maker recommends",
  "Oil change done by our technicians, with the filter checked",
];

/** Rotating "authorized dealer" seal (text on a circle around an oil drop). */
function DealerSeal() {
  return (
    <div className="relative mx-auto size-64 sm:size-72" aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(251_206_7/0.25),transparent_65%)] blur-2xl" />
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full animate-[spin_24s_linear_infinite]">
        <defs>
          <path id="seal-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className="fill-[#FBCE07] text-[13px] font-bold tracking-[0.32em] uppercase">
          <textPath href="#seal-circle" textLength="486" lengthAdjust="spacing">
            Authorized Dealer • Shell Helix • Genuine Oil •
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[22%] flex items-center justify-center rounded-full border border-[#FBCE07]/40 bg-[radial-gradient(circle_at_30%_30%,#2a2208,#0e0e10_70%)] shadow-[0_0_60px_rgb(251_206_7/0.15)]">
        <div className="text-center">
          <Droplets className="mx-auto size-12 text-[#FBCE07]" />
          <p className="mt-2 font-display text-2xl leading-none text-white">Shell Helix</p>
          <p className="mt-1 text-[0.65rem] font-semibold tracking-[0.25em] text-brand-500 uppercase">Jayma Motors</p>
        </div>
      </div>
    </div>
  );
}

/** Home: authorized Shell Helix dealer highlight (Jayma's differentiator). */
export function ShellHelixSection() {
  return (
    <section id="shell-helix" aria-labelledby="shell-heading" className="scroll-mt-20">
      <Container className="py-10 2xl:py-15">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink-900/70 px-6 py-12 backdrop-blur-sm sm:px-12 lg:py-16">
          {/* Shell-yellow and brand-red glows */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_85%_50%,rgb(251_206_7/0.12),transparent_70%),radial-gradient(ellipse_45%_60%_at_0%_100%,rgb(93_21_20/0.55),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 via-[#FBCE07] to-brand-600"
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
            <div>
              <p className="text-sm font-semibold tracking-widest text-[#FBCE07] uppercase">
                Authorized Shell Helix dealer
              </p>
              <h2
                id="shell-heading"
                className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl"
              >
                Genuine oil, <span className="text-brand-500">longer engine life</span>
              </h2>
              <p className="mt-4 max-w-xl text-zinc-400">
                Your engine is only as good as its oil. As an authorized Shell Helix dealer, we use and supply genuine
                Shell Helix lubricants — the right grade, every time.
              </p>

              <ul className="mt-8 space-y-3">
                {POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-zinc-200">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                  Popular grades in stock
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {SHELL_GRADES.map((grade) => (
                    <li
                      key={grade}
                      className="rounded-full border border-[#FBCE07]/30 bg-[#FBCE07]/5 px-3.5 py-1.5 text-sm font-bold text-[#FBCE07] tabular-nums"
                    >
                      {grade}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Button href="#book-routine-maintenance" size="lg">
                  Book an oil change
                </Button>
                <Button href="/products" variant="outline-light" size="lg">
                  View lubricants
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
            </div>

            <DealerSeal />
          </div>
        </div>
      </Container>
    </section>
  );
}
