import { Award, Cpu, Droplets, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TRUST_ITEMS } from "@/lib/home-content";

const ICONS = { Award, Cpu, Droplets, ShieldCheck };

/** Home section 2 (Step 5 §6.1): four reasons to trust the workshop. */
export function TrustStrip() {
  return (
    <section aria-label="Why trust Jayma Motors" className="border-b border-zinc-200 bg-white">
      <Container>
        <ul className="grid grid-cols-2 divide-zinc-200 py-6 lg:grid-cols-4 lg:divide-x lg:py-8">
          {TRUST_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <li key={item.title} className="flex items-center gap-3 px-2 py-3 sm:gap-4 lg:justify-center lg:px-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 sm:size-12">
                  <Icon className="size-5 sm:size-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm leading-tight font-semibold text-ink-950 sm:text-base">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-500 sm:text-sm">{item.text}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
