"use client";

import { ArrowRight, Check, ChevronsLeftRight, Clock, Sparkles } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const clamp = (value) => Math.min(1, Math.max(0, value));

function subscribeReducedMotion(callback) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getReducedMotionOnServer = () => false;

/**
 * Wash & detailing steps (owner to confirm the exact package). Each lights up
 * as the sweep passes its `at` point (reveal runs 0.5 → 1 while scrolling).
 */
const DETAIL_STEPS = [
  { at: 0.55, title: "Snow-foam pre-wash", text: "Loosens caked mud without scratching the paint." },
  { at: 0.65, title: "Hand wash & wheels", text: "Two-bucket wash, arches and rims deep-cleaned." },
  { at: 0.75, title: "Clay & decontaminate", text: "Removes tar and grit the wash leaves behind." },
  { at: 0.85, title: "Machine polish", text: "Lifts swirls and dullness for a deep gloss." },
  { at: 0.95, title: "Wax & interior finish", text: "Protective layer outside, vacuum and wipe inside." },
];

/**
 * Home: "scroll to wash it" before/after (idea from the owner's reference
 * reel). The section pins while the visitor scrolls and a glowing line sweeps
 * across the car, revealing the clean finish; the line can also be dragged.
 * Reduced motion: a normal drag slider.
 *
 * Images: owner-supplied matching pair (AI-generated showroom SUV, muddy and
 * clean, 1421×1107). Any replacement pair must share size and framing exactly.
 */
export function BeforeAfterSection() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const dragging = useRef(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getReducedMotionOnServer);
  // 0 = all "before" visible, 1 = all "after".
  const [reveal, setReveal] = useState(0.5);

  const measure = useCallback(() => {
    if (dragging.current) return;
    const section = sectionRef.current;
    if (!section) return;
    const distance = section.offsetHeight - window.innerHeight;
    const progress = distance > 0 ? clamp(-section.getBoundingClientRect().top / distance) : 1;
    // Starts split in the middle (half muddy, half clean), holds briefly, then
    // sweeps until the whole car is clean and holds there.
    setReveal(0.5 + 0.5 * clamp((progress - 0.12) / 0.72));
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure, reducedMotion]);

  const setFromPointer = (event) => {
    const rect = stageRef.current.getBoundingClientRect();
    setReveal(clamp((event.clientX - rect.left) / rect.width));
  };
  const onPointerDown = (event) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event);
  };
  const onPointerMove = (event) => dragging.current && setFromPointer(event);
  const onPointerUp = () => {
    dragging.current = false;
  };
  const onKeyDown = (event) => {
    const step = event.shiftKey ? 0.1 : 0.04;
    if (event.key === "ArrowLeft") setReveal((value) => clamp(value - step));
    else if (event.key === "ArrowRight") setReveal((value) => clamp(value + step));
    else return;
    event.preventDefault();
  };

  const percent = reveal * 100;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="before-after-heading"
      className={cn("relative", reducedMotion ? "" : "h-[260vh]")}
    >
      {/* justify-center-safe: if the content is ever taller than the screen, it starts at the top instead of clipping both ends. */}
      <div
        className={cn(
          "flex flex-col justify-center-safe overflow-hidden",
          reducedMotion ? "py-10" : "sticky top-0 h-dvh pt-20 lg:pt-24",
        )}
      >
        {/* Red stage glow behind the car */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_62%,rgb(162_34_31/0.35),transparent_70%)]"
        />

        {/* Phones: text above the photo. Laptops: text column left, photo right, so the
            photo can use the full screen height at its natural shape (no cropping). */}
        <Container className="relative flex flex-col lg:flex-row lg:items-center lg:gap-12">
          <div className="lg:w-80 lg:shrink-0 xl:w-96">
            <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">Wash &amp; detailing</p>
            <h2
              id="before-after-heading"
              className="mt-2 font-display text-4xl leading-[1.05] font-medium text-white sm:text-5xl"
            >
              From muddy to <span className="text-brand-500">mirror shine</span>
            </h2>

            {/* Laptops: the full checklist, lighting up as the car is washed. Short laptop
                screens (scaled displays) get a compact list, or none, so the button never clips. */}
            <ol className="mt-6 hidden space-y-3 lg:block [@media(max-height:560px)]:hidden! [@media(max-height:720px)]:mt-4 [@media(max-height:720px)]:space-y-2">
              {DETAIL_STEPS.map((item) => {
                const done = reveal >= item.at;
                return (
                  <li key={item.title} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ring-1 transition duration-500",
                        done ? "bg-brand-600 text-white ring-brand-500" : "bg-white/5 text-zinc-600 ring-white/15",
                      )}
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className={cn("transition-opacity duration-500", done ? "opacity-100" : "opacity-50")}>
                      <span className="block font-bold text-white">{item.title}</span>
                      <span className="block text-sm text-zinc-400 [@media(max-height:720px)]:hidden">{item.text}</span>
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 hidden items-center gap-5 lg:flex [@media(max-height:720px)]:mt-5">
              <Button href="#book-body-painting-detailing">
                Book detailing
                <ArrowRight aria-hidden="true" />
              </Button>
              <p className="flex items-center gap-1.5 text-sm text-zinc-400">
                <Clock className="size-4 text-brand-500" aria-hidden="true" />
                Ready the same day
              </p>
            </div>
          </div>

          {/* Comparison stage */}
          <div
            ref={stageRef}
            role="slider"
            tabIndex={0}
            aria-label="Before and after comparison — drag or use arrow keys"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percent)}
            aria-valuetext={`${Math.round(percent)}% washed`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
            // Natural photo shape, never cropped. On laptops it fills the rest of the
            // row, capped so its height fits the pinned screen (ratio 1421/1107 ≈ 1.284).
            className="relative mt-6 aspect-[1421/1107] w-full cursor-ew-resize touch-pan-y overflow-hidden rounded-[1.25rem] shadow-2xl ring-1 shadow-black/60 ring-white/15 select-none sm:mt-8 lg:mt-0 lg:ml-auto lg:max-w-[calc((100dvh-8rem)*1.284)] lg:flex-1"
          >
            <Image
              src="/images/before-after/suv-muddy.webp"
              alt="SUV before the wash: caked in wet mud"
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              className="pointer-events-none object-cover"
              draggable={false}
            />
            <Image
              src="/images/before-after/suv-clean.webp"
              alt="Same SUV after the wash: clean, polished, glossy grey paint"
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              className="pointer-events-none object-cover"
              style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
              draggable={false}
            />

            {/* Sweep line + handle */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0" style={{ left: `${percent}%` }}>
              <div className="absolute inset-y-[6%] -left-px w-0.5 bg-gradient-to-b from-transparent via-brand-500 to-transparent shadow-[0_0_24px_4px_rgb(224_64_62/0.55)]" />
              <div className="absolute top-1/2 left-0 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg ring-4 shadow-brand-900/60 ring-white/90">
                <ChevronsLeftRight className="size-5" />
              </div>
            </div>

            {/* The restored finish is revealed from the left, so "After" sits left. */}
            <span
              className={cn(
                "absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold tracking-widest text-white uppercase shadow-lg transition-opacity",
                reveal < 0.15 ? "opacity-0" : "opacity-100",
              )}
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              After
            </span>
            <span
              className={cn(
                "absolute top-4 right-4 rounded-full border border-white/15 bg-ink-950/80 px-3 py-1.5 text-xs font-bold tracking-widest text-zinc-300 uppercase backdrop-blur transition-opacity",
                reveal > 0.85 ? "opacity-0" : "opacity-100",
              )}
            >
              Before
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between lg:hidden">
            {/* Phones: a one-line summary of the package instead of the checklist. */}
            <p className="text-center text-sm text-zinc-400 sm:text-left">
              Snow foam · hand wash · clay · polish · wax
              <span className="mt-1 flex items-center justify-center gap-1.5 text-zinc-500 sm:justify-start">
                <Clock className="size-4 text-brand-500" aria-hidden="true" />
                Ready the same day
              </span>
            </p>
            <Button href="#book-body-painting-detailing">
              Book detailing
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </Container>
      </div>
    </section>
  );
}
