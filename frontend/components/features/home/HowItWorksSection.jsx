import { ArrowRight, CalendarCheck, KeyRound, ScanLine, Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HOW_STEPS } from "@/lib/home-content";

const ICONS = { CalendarCheck, KeyRound, ScanLine, Wrench };

/** Home: the four steps from booking to pick-up, joined by a line on wide screens. */
export function HowItWorksSection() {
  return (
    <section aria-labelledby="how-heading">
      <Container className="py-10 2xl:py-15">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">How it works</p>
          <h2 id="how-heading" className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl">
            From booking to keys, <span className="text-brand-500">made easy</span>
          </h2>
        </div>

        <ol className="relative mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* Connecting line behind the icons (desktop row only). */}
          <span
            aria-hidden="true"
            className="absolute top-8 right-[12.5%] left-[12.5%] hidden h-px bg-[linear-gradient(to_right,transparent,rgb(224_64_62/0.6)_15%,rgb(224_64_62/0.6)_85%,transparent)] lg:block"
          />
          {HOW_STEPS.map((step) => {
            const Icon = ICONS[step.icon];
            return (
              <li key={step.title} className="group relative flex flex-col items-center text-center">
                <span className="relative flex size-16 items-center justify-center rounded-full bg-ink-950 text-brand-500 ring-1 ring-brand-500/40 transition duration-300 group-hover:bg-brand-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand-900/50">
                  <span aria-hidden="true" className="absolute inset-1.5 rounded-full bg-brand-600/10" />
                  <Icon className="relative size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">{step.text}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 flex justify-center">
          <Button href="#appointment">
            Book your slot
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
