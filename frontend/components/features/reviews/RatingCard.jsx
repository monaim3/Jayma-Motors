import { ExternalLink, PenLine } from "lucide-react";
import { GoogleIcon } from "@/components/brand/GoogleIcon";
import { Stars } from "@/components/features/reviews/Stars";
import { buttonClasses } from "@/components/ui/Button";
import { SITE } from "@/lib/constants";
import { GOOGLE_RATING } from "@/lib/reviews-content";

/** Reviews hero card: Google score, stars, and a bar per star level (bars grow in on load). */
export function RatingCard() {
  const { average, total, breakdown, checked } = GOOGLE_RATING;
  const max = Math.max(...Object.values(breakdown));

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-full bg-brand-600/25 blur-3xl motion-safe:animate-pulse"
      />
      <div className="rounded-[1.5rem] border border-white/15 bg-ink-900/80 p-6 shadow-2xl shadow-black/60 backdrop-blur sm:p-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <GoogleIcon className="size-5" />
          Google reviews
        </p>

        <div className="mt-4 flex items-end gap-5">
          <p className="font-display text-7xl leading-none font-medium text-white sm:text-8xl">{average.toFixed(1)}</p>
          <div className="pb-2">
            <Stars rating={average} starClassName="size-6" />
            <p className="mt-1.5 text-sm text-zinc-400">
              Based on <strong className="text-white">{total}</strong> reviews
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-2" aria-label="Ratings breakdown">
          {[5, 4, 3, 2, 1].map((level, i) => (
            <li key={level} className="flex items-center gap-3 text-sm">
              <span className="w-6 text-zinc-300 tabular-nums">{level}★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full origin-left rounded-full bg-gradient-to-r from-brand-700 to-amber-400 motion-safe:animate-[bar-grow_1.1s_cubic-bezier(.22,1,.36,1)_both]"
                  style={{ width: `${(breakdown[level] / max) * 100}%`, animationDelay: `${200 + i * 90}ms` }}
                />
              </span>
              <span className="w-7 text-right text-zinc-400 tabular-nums">
                {breakdown[level]}
                <span className="sr-only"> reviews with {level} stars</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <a href={SITE.googleWriteReviewUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses()}>
            <PenLine aria-hidden="true" />
            Write a review
          </a>
          <a
            href={SITE.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "outline-light" })}
          >
            Read on Google
            <ExternalLink aria-hidden="true" />
          </a>
        </div>
        <p className="mt-4 text-xs text-zinc-500">From our Google Business listing, {checked}.</p>
      </div>
    </div>
  );
}
