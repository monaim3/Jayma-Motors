"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/constants";
import { HERO_BUILD_END, HERO_STAGES } from "@/lib/home-content";
import { cn } from "@/lib/utils";
import { HeroCar3D } from "./HeroCar3D";

const clamp = (value) => Math.min(1, Math.max(0, value));

function subscribeReducedMotion(callback) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getReducedMotionOnServer = () => false;

/**
 * Home hero (Step 5 §6.1.1): the section is pinned while the visitor scrolls
 * through it; the car assembles and each stage names a Jayma service.
 * Reduced-motion visitors get the finished car and the stages as a list.
 */
/** Caption shown for a given scroll progress (the last one stays during the drive-off). */
function stageAt(progress) {
  const build = Math.min(1, progress / HERO_BUILD_END);
  return Math.min(HERO_STAGES.length - 1, Math.floor(build * HERO_STAGES.length));
}

export function ScrollBuiltHero() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const textRef = useRef(null);
  // Set once the live car reports its progress; from then on it drives the caption.
  const carDrivesCaptionRef = useRef(false);
  // Scroll progress lives in a ref: the 3D scene reads it every frame, so
  // scrolling doesn't re-render React. State changes only when the caption does.
  const progressRef = useRef(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [atTop, setAtTop] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getReducedMotionOnServer);

  const measure = useCallback(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;

    const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
    const distance = section.offsetHeight - sticky.offsetHeight;
    const next = distance > 0 ? clamp((stickyTop - section.getBoundingClientRect().top) / distance) : 1;

    progressRef.current = next;
    // Once the live car runs, the caption follows the car itself (onCarProgress),
    // so a quick flick never shows "Painting" over a car that is still being built.
    if (!carDrivesCaptionRef.current) setStageIndex(stageAt(next));
    setAtTop(next < 0.03);
  }, []);

  const onCarProgress = useCallback((value) => {
    carDrivesCaptionRef.current = true;
    setStageIndex(stageAt(value));
  }, []);

  /**
   * Phones: the part of the stage not covered by the text or the sticky
   * booking bar, as fractions of the stage height. The 3D scene frames the car in it.
   */
  const getFreeArea = useCallback(() => {
    const sticky = stickyRef.current;
    const text = textRef.current;
    if (!sticky || !text) return undefined;
    const stage = sticky.getBoundingClientRect();
    // Hidden (lg:hidden) bar has no size; then the stage runs to the bottom.
    const bar = document.querySelector("[data-booking-bar]")?.getBoundingClientRect();
    const barTop = bar?.height ? bar.top - stage.top : stage.height;
    return {
      top: (text.getBoundingClientRect().bottom - stage.top + 24) / stage.height,
      bottom: Math.min(stage.height, barTop) / stage.height,
    };
  }, []);

  // Reduced motion: the finished car standing still (no drive-off).
  const getProgress = useCallback(() => (reducedMotion ? HERO_BUILD_END : progressRef.current), [reducedMotion]);

  // The hero tells a story from the top, so a reload starts at the floating parts
  // instead of the browser restoring the previous scroll position mid-animation.
  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    if (!window.location.hash) window.scrollTo(0, 0);
    return () => {
      window.history.scrollRestoration = previous;
    };
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

  const shownStage = reducedMotion ? HERO_STAGES.length - 1 : stageIndex;
  const stage = HERO_STAGES[shownStage];
  // Line-art fallback (no WebGL) steps through the stages.
  const fallbackProgress = reducedMotion ? HERO_BUILD_END : ((shownStage + 0.5) / HERO_STAGES.length) * HERO_BUILD_END;

  /** Scroll so the given stage is in view (progress rail buttons). */
  const goToStage = (index) => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;
    const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
    const distance = section.offsetHeight - sticky.offsetHeight;
    const target = ((index + 0.5) / HERO_STAGES.length) * HERO_BUILD_END;
    window.scrollTo({
      top: window.scrollY + section.getBoundingClientRect().top - stickyTop + target * distance,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Jayma Motors services"
      className={cn("relative bg-ink-950 text-white", reducedMotion ? "" : "h-[490vh] lg:h-[550vh]")}
    >
      <div
        ref={stickyRef}
        className={cn(
          "overflow-hidden",
          reducedMotion
            ? "relative h-dvh"
            : // Full screen: the transparent header floats over the top of the stage.
              "sticky top-0 h-dvh",
        )}
      >
        {/* Backdrop: red glow from the logo's swoosh gradient + workshop floor grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_68%_55%,var(--color-brand-900),transparent_58%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] [mask-image:linear-gradient(to_top,black,transparent)] bg-[size:48px_48px] bg-[position:left_bottom_24px]"
        />

        {/* 3D stage fills the hero; the camera frames the car beside (desktop) or below (phones) the text. */}
        {/* Soft fade at the bottom so the hero flows into the booking form below. */}
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_85%,transparent)]">
          <HeroCar3D
            getProgress={getProgress}
            getFreeArea={getFreeArea}
            onProgress={onCarProgress}
            fallbackProgress={fallbackProgress}
          />
        </div>
        {/* Keeps the text readable when floating parts drift behind it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-ink-950/85 to-transparent lg:inset-y-0 lg:right-auto lg:h-auto lg:w-[52%] lg:bg-gradient-to-r lg:from-ink-950 lg:via-ink-950/70"
        />

        {/* Top padding clears the fixed header (80px phones, 96px desktop) with breathing room. */}
        <Container className="pointer-events-none relative flex h-full flex-col pt-28 sm:pt-32 lg:justify-center-safe lg:pt-36 lg:pb-12">
          <div ref={textRef} className="pointer-events-auto max-w-md xl:max-w-lg">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-500 uppercase sm:text-sm">
              Independent multi-brand workshop · Dhaka · Since {SITE.since}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl xl:text-6xl">
              Your Car&apos;s Care, Our <span className="text-brand-500">Commitment</span>
            </h1>

            {reducedMotion ? (
              <ol className="mt-6 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                {HERO_STAGES.map((item) => (
                  <li key={item.key} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                    {item.title}
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-6 min-h-24 sm:min-h-28" aria-live="polite">
                <div key={stage.key} className="animate-[hero-fade_400ms_ease-out]">
                  <h2 className="font-display text-2xl font-medium text-white sm:text-3xl">{stage.title}</h2>
                  <p className="mt-2 max-w-md text-sm text-zinc-300 sm:text-base">{stage.text}</p>
                </div>
              </div>
            )}
          </div>
        </Container>

        {!reducedMotion && (
          <>
            {/* Progress rail */}
            <nav
              aria-label="Service stages"
              className="absolute top-1/2 right-3 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex lg:right-6"
            >
              <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/15" />
              {HERO_STAGES.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => goToStage(index)}
                  aria-label={`Show: ${item.title}`}
                  aria-current={index === stageIndex ? "step" : undefined}
                  className={cn(
                    "relative size-3 rounded-full border-2 transition-colors",
                    index <= stageIndex ? "border-brand-500 bg-brand-500" : "border-white/40 bg-ink-950",
                  )}
                />
              ))}
            </nav>

            {/* Scroll cue */}
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-x-0 bottom-4 flex flex-col items-center gap-1 text-xs text-zinc-400 transition-opacity",
                atTop ? "opacity-100" : "opacity-0",
              )}
            >
              Scroll to build
              <ChevronDown className="size-4 animate-bounce" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
