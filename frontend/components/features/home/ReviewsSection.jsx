"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HOME_REVIEWS } from "@/lib/home-content";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = ["#c42927", "#d97706", "#52525b", "#7f1d1d", "#78716c"];
const AUTOPLAY_MS = 4500;
const TOTAL = HOME_REVIEWS.length;

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn("size-4", i < rating ? "fill-amber-400 text-amber-400" : "fill-white/15 text-white/15")}
        />
      ))}
    </span>
  );
}

/** Shortest signed distance from the active card, wrapping around the list. */
function offsetOf(index, active) {
  let offset = index - active;
  if (offset > TOTAL / 2) offset -= TOTAL;
  if (offset < -TOTAL / 2) offset += TOTAL;
  return offset;
}

/**
 * Home: customer reviews as a 3D carousel — the active card faces front, its
 * neighbours swing back on either side (rotateY) with a red tint toward the
 * centre. Arrows on the side cards (dots row on phones), dots, swipe, click a
 * side card, and autoplay while on screen. Real Google reviews (lib/reviews-content).
 */
export function ReviewsSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const stageRef = useRef(null);
  const swipeStart = useRef(null);

  const go = (step) => setActive((current) => (current + step + TOTAL) % TOTAL);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Restarts after every change, so a manual click gets a full interval too.
  useEffect(() => {
    if (!inView || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => setActive((current) => (current + 1) % TOTAL), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [active, inView, paused]);

  const onPointerUp = (event) => {
    if (swipeStart.current === null) return;
    const dx = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (dx < -40) go(1);
    else if (dx > 40) go(-1);
  };

  const mobileArrow =
    "flex size-10 items-center justify-center rounded-full border border-white/15 bg-ink-900 text-white shadow-lg shadow-brand-900/30 sm:hidden";

  return (
    <section aria-labelledby="reviews-heading" className="overflow-hidden">
      <Container className="py-10 2xl:py-15">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">Customer reviews</p>
          <h2
            id="reviews-heading"
            className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl"
          >
            What our customers <span className="text-brand-500">say</span>
          </h2>
        </div>

        <div
          ref={stageRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer reviews"
          className="relative h-[330px] touch-pan-y [perspective:1200px] sm:h-[340px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onPointerDown={(event) => (swipeStart.current = event.clientX)}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipeStart.current = null)}
        >
          {HOME_REVIEWS.map((review, index) => {
            const offset = offsetOf(index, active);
            const distance = Math.abs(offset);
            const side = offset < 0 ? -1 : 1;
            const visible = distance <= 1;
            const isActive = offset === 0;
            const x = isActive ? 0 : side * (distance === 1 ? 92 : 160);
            return (
              <figure
                key={review.name}
                aria-hidden={!visible}
                onClick={() => !isActive && visible && go(offset)}
                style={{
                  zIndex: 10 - distance,
                  transform: `translateX(${x}%) rotateY(${isActive ? 0 : -side * 32}deg) scale(${isActive ? 1 : 0.88})`,
                }}
                className={cn(
                  "absolute top-0 left-[calc(50%-140px)] flex h-full w-[280px] flex-col gap-4 rounded-[20px] bg-ink-900 p-6 transition-[transform,opacity] duration-[600ms] ease-[cubic-bezier(.22,1,.36,1)] select-none [transform-style:preserve-3d] sm:left-[calc(50%-180px)] sm:w-[360px] sm:p-7",
                  isActive
                    ? "shadow-[0_20px_50px_rgb(196_41_39/0.28)] ring-1 ring-white/15"
                    : "cursor-pointer ring-1 ring-white/10",
                  visible ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <figcaption className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                    className="flex size-14 shrink-0 items-center justify-center rounded-full text-[22px] font-semibold text-white shadow-[0_6px_16px_rgb(0_0_0/0.45)] ring-4 ring-white/10"
                  >
                    {review.name.charAt(0)}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-lg leading-7 font-bold text-white capitalize">
                      {review.name.toLowerCase()}
                    </span>
                    <span className="text-[13px] leading-5 text-zinc-400">
                      {review.localGuide ? "Local Guide" : "Google review"} · {review.year}
                    </span>
                  </span>
                </figcaption>
                <Stars rating={review.rating} />
                <blockquote className="line-clamp-6 text-[15px] leading-6 text-zinc-300">
                  <p>&ldquo;{review.text}&rdquo;</p>
                </blockquote>

                {/* Side cards: red shade deepening toward the centre card. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-[20px] from-transparent to-brand-700/55 transition-opacity duration-400",
                    offset < 0 ? "bg-gradient-to-r" : "bg-gradient-to-l",
                    isActive ? "opacity-0" : "opacity-100",
                  )}
                />

                {distance === 1 && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      go(offset);
                    }}
                    aria-label={offset < 0 ? "Previous review" : "Next review"}
                    className={cn(
                      "absolute top-1/2 z-20 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-950 text-white shadow-[0_8px_24px_rgb(196_41_39/0.35)] transition duration-300 hover:scale-110 hover:border-brand-500 hover:bg-brand-600 sm:flex",
                      offset < 0 ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
                    )}
                  >
                    {offset < 0 ? (
                      <ChevronLeft className="size-6" strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <ChevronRight className="size-6" strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </button>
                )}
              </figure>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-1 sm:mt-8 sm:gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="Previous review" className={cn(mobileArrow, "mr-2")}>
            <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
          {HOME_REVIEWS.map((review, index) => (
            <button
              key={review.name}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show review ${index + 1}`}
              aria-current={index === active}
              className="flex h-10 min-w-4 items-center justify-center"
            >
              <span
                className={cn(
                  "block h-2 rounded-full transition-all duration-300",
                  index === active ? "w-6 bg-brand-600" : "w-2 bg-white/20 hover:bg-brand-500/60",
                )}
              />
            </button>
          ))}
          <button type="button" onClick={() => go(1)} aria-label="Next review" className={cn(mobileArrow, "ml-2")}>
            <ChevronRight className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/reviews" variant="outline-light">
            Read all reviews
          </Button>
          <Button href="/reviews#write">
            Write a review
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
