"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { HOME_STATS } from "@/lib/home-content";
import { cn } from "@/lib/utils";

const format = (value) => Math.round(value).toLocaleString("en-US");

/**
 * Counts up from 0 when scrolled into view. The server renders the final
 * number (readable without JS); the count-up writes straight to the DOM.
 */
function Counter({ value, unit, suffix }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    node.textContent = "0";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1600;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          node.textContent = format(value * (1 - (1 - t) ** 3));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <>
      <span ref={ref} className="tabular-nums">
        {format(value)}
      </span>
      {unit}
      <span className="text-brand-500">{suffix}</span>
    </>
  );
}

/** Home: key numbers at a glance. */
export function StatsBand() {
  return (
    <section aria-label="Jayma Motors in numbers">
      <Container className="py-6 sm:py-10">
        <dl className="grid grid-cols-2 overflow-hidden rounded-card border border-white/10 bg-surface backdrop-blur-sm lg:grid-cols-4">
          {HOME_STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "relative flex flex-col items-center gap-1 border-white/10 px-4 py-8 text-center sm:py-10",
                index % 2 === 1 && "border-l",
                index >= 2 && "border-t lg:border-t-0",
                index === 2 && "lg:border-l",
              )}
            >
              <dt className="order-2 text-xs font-semibold tracking-[0.18em] text-zinc-400 uppercase sm:text-sm">
                {stat.label}
              </dt>
              <dd className="order-1 font-display text-4xl font-medium text-white sm:text-5xl lg:text-6xl">
                <Counter value={stat.value} unit={stat.unit} suffix={stat.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
