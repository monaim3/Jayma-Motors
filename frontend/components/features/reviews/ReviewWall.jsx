"use client";

import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { GoogleIcon } from "@/components/brand/GoogleIcon";
import { Stars } from "@/components/features/reviews/Stars";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = ["#c42927", "#d97706", "#52525b", "#7f1d1d", "#78716c", "#0f766e"];
/** Each loop half needs enough cards to be wider than a 2xl screen. */
const MIN_PER_ROW = 6;
const SECONDS_PER_CARD = 7;

function ReviewCard({ review }) {
  const short = review.text.length < 45 && !review.textBn;
  return (
    <figure
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-card border border-white/10 bg-ink-900/80 p-6 backdrop-blur-sm transition duration-300 hover:border-brand-500/40 hover:bg-ink-900 hover:shadow-[0_18px_40px_rgb(196_41_39/0.18)]",
        // Bangla + translation runs long: a wider card keeps the row height down.
        review.textBn ? "w-[340px] sm:w-[540px]" : "w-[300px] sm:w-[360px]",
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 right-3 font-display text-[7rem] leading-none text-white/[0.04] transition-colors group-hover:text-brand-500/15"
      >
        &rdquo;
      </span>
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        <GoogleIcon className="size-4 opacity-70" />
      </div>

      <blockquote className="mt-4 flex-1">
        {review.textBn ? (
          <>
            <p lang="bn" className="text-[15px] leading-7 text-zinc-200">
              &ldquo;{review.textBn}&rdquo;
            </p>
            <p className="mt-3 border-l-2 border-white/10 pl-3 text-sm leading-6 text-zinc-500">
              <span className="sr-only">Translation: </span>
              {review.text}
            </p>
          </>
        ) : (
          <p
            className={short ? "font-display text-2xl leading-snug text-white" : "text-[15px] leading-7 text-zinc-300"}
          >
            &ldquo;{review.text}&rdquo;
          </p>
        )}
      </blockquote>

      <figcaption className="mt-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          style={{ background: AVATAR_COLORS[review.name.length % AVATAR_COLORS.length] }}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white uppercase ring-2 ring-white/10"
        >
          {review.name.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-bold text-white capitalize">{review.name.toLowerCase()}</span>
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            {review.localGuide && (
              <>
                <BadgeCheck className="size-3.5 text-amber-400" aria-hidden="true" />
                Local Guide ·
              </>
            )}
            {review.year}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * One endless row: the card list (repeated up to MIN_PER_ROW) twice over, so
 * sliding by -50% loops seamlessly. `reverse` runs it left-to-right.
 * Hover pauses it; with reduced motion it becomes a plain swipeable row.
 */
function MarqueeRow({ items, reverse, label }) {
  let half = items;
  while (half.length < MIN_PER_ROW) half = [...half, ...items];

  return (
    <div
      role="region"
      aria-label={label}
      className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]"
    >
      <ul
        // Inline: the animate-marquee shorthand would reset a class-based direction.
        style={{
          animationDuration: `${half.length * SECONDS_PER_CARD}s`,
          animationDirection: reverse ? "reverse" : undefined,
        }}
        className="flex w-max items-stretch py-3 hover:[animation-play-state:paused] motion-safe:animate-marquee"
      >
        {[...half, ...half].map((review, i) => (
          // Copies after the first list are for the loop only — hidden from screen readers.
          <li key={i} aria-hidden={i >= items.length || undefined} className="shrink-0 pr-4">
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Reviews page: topic filter chips, then two endless rows of review cards —
 * the top one sliding left, the bottom one right — and a link to the full
 * list on Google. Rows restart (fade in) when the filter changes.
 */
export function ReviewWall({ reviews, topics, total }) {
  const [topic, setTopic] = useState("all");
  const shown = topic === "all" ? reviews : reviews.filter((review) => review.topics.includes(topic));
  const chips = [
    { slug: "all", label: "All", count: reviews.length },
    ...topics.map((t) => ({ ...t, count: reviews.filter((review) => review.topics.includes(t.slug)).length })),
  ];

  // Long lists split between the rows; short ones run in both (reversed) so the rows differ.
  const split = shown.length >= 8;
  const top = split ? shown.filter((_, i) => i % 2 === 0) : shown;
  const bottom = split ? shown.filter((_, i) => i % 2 === 1) : [...shown].reverse();

  return (
    <>
      <Container>
        <div role="group" aria-label="Filter reviews by topic" className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.slug}
              type="button"
              onClick={() => setTopic(chip.slug)}
              aria-pressed={topic === chip.slug}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                topic === chip.slug
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-white/15 text-zinc-300 hover:border-brand-500/60 hover:text-white",
              )}
            >
              {chip.label} <span className={topic === chip.slug ? "text-white/70" : "text-zinc-500"}>{chip.count}</span>
            </button>
          ))}
        </div>
      </Container>

      <div key={topic} className="mt-8 space-y-2 motion-safe:animate-[hero-fade_500ms_ease-out_both]">
        <MarqueeRow items={top} label="Customer reviews" />
        <MarqueeRow items={bottom} reverse label="More customer reviews" />
      </div>

      <Container className="mt-8 flex justify-center">
        <a
          href={SITE.googleReviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-4 rounded-full bg-gradient-to-r from-brand-600 to-brand-900 py-2 pr-6 pl-2 text-white shadow-lg shadow-brand-900/40 transition duration-300 hover:-translate-y-0.5"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-white">
            <GoogleIcon className="size-5" />
          </span>
          <span className="font-semibold">See all {total} reviews on Google</span>
          <ArrowUpRight
            className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </a>
      </Container>
    </>
  );
}
