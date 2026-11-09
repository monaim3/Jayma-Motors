import { BadgeCheck, Quote, Star } from "lucide-react";
import { GoogleIcon } from "@/components/brand/GoogleIcon";
import { ContactBand } from "@/components/features/home/ContactBand";
import { RatingCard } from "@/components/features/reviews/RatingCard";
import { ReviewWall } from "@/components/features/reviews/ReviewWall";
import { Stars } from "@/components/features/reviews/Stars";
import { WriteReviewBand } from "@/components/features/reviews/WriteReviewBand";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { FEATURED_REVIEW, GOOGLE_RATING, GOOGLE_REVIEWS, REVIEW_SNIPPETS, REVIEW_TOPICS } from "@/lib/reviews-content";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Customer Reviews",
  description: `Rated ${GOOGLE_RATING.average} from ${GOOGLE_RATING.total} Google reviews — read what car owners say about Jayma Motors' service, repair and car wash in Vatara, Dhaka.`,
  alternates: { canonical: "/reviews" },
};

const { breakdown, total } = GOOGLE_RATING;
const happyShare = Math.round(((breakdown[5] + breakdown[4]) / total) * 100);

const HIGHLIGHTS = [
  { value: `${happyShare}%`, label: "rate us 4 or 5 stars" },
  { value: total, label: "reviews on Google" },
  { value: "8+ yrs", label: "of customer reviews" },
];

/** One tilted band of moving review snippets; the track holds two copies so -50% loops. */
function SnippetBand({ reverse, className }) {
  const items = [...REVIEW_SNIPPETS, ...REVIEW_SNIPPETS];
  return (
    <div className={cn("-mx-[5%] w-[110%] overflow-hidden py-4", className)}>
      <ul
        // Inline: the animate-marquee shorthand would reset a class-based direction.
        style={{ animationDirection: reverse ? "reverse" : undefined }}
        className="flex w-max hover:[animation-play-state:paused] motion-safe:animate-marquee"
      >
        {items.map((snippet, i) => (
          <li key={i} className="flex items-center gap-6 pr-6 font-display text-xl whitespace-nowrap sm:text-2xl">
            &ldquo;{snippet}&rdquo;
            <Star className="size-4 fill-current opacity-70" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Reviews (Step 5 §6.6): real Google reviews until the reviews API (F7/B7) lands. */
export default function ReviewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Customer reviews"
        title={
          <>
            Trusted by Dhaka&apos;s <span className="text-brand-500">car owners</span>
          </>
        }
        intro="Honest work gets honest words. Here's what customers say about us on Google — the good service, the fair prices and the people who care for their cars."
        crumbs={[{ label: "Reviews" }]}
        aside={<RatingCard />}
      />

      {/* Crossed bands of moving quotes (decorative: every line is also in the wall below). */}
      <section aria-hidden="true" className="relative isolate overflow-hidden py-16 sm:py-24">
        <SnippetBand className="-rotate-3 bg-brand-600 text-white shadow-xl shadow-black/50" />
        <SnippetBand
          reverse
          className="absolute top-1/2 left-0 -z-10 -translate-y-1/2 rotate-3 bg-zinc-100 text-ink-950/70"
        />
      </section>

      {/* Spotlight: the latest detailed review + highlights */}
      <section aria-labelledby="spotlight-heading">
        <Container className="grid items-stretch gap-6 py-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] 2xl:py-15">
          <figure className="relative rounded-[1.5rem] bg-gradient-to-br from-brand-500/70 via-white/10 to-white/5 p-px">
            <div className="relative h-full overflow-hidden rounded-[calc(1.5rem-1px)] bg-ink-900 p-7 sm:p-10">
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-24 size-72 rounded-full bg-brand-600/20 blur-3xl"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2
                  id="spotlight-heading"
                  className="rounded-full bg-brand-600/15 px-3 py-1 text-xs font-semibold tracking-widest text-brand-500 uppercase ring-1 ring-brand-500/30"
                >
                  Latest review
                </h2>
                <Stars rating={FEATURED_REVIEW.rating} starClassName="size-5" />
              </div>
              <Quote className="mt-6 size-10 fill-brand-600 text-brand-600" aria-hidden="true" />
              <blockquote className="mt-4">
                <p className="font-display text-xl leading-relaxed text-white sm:text-2xl sm:leading-relaxed">
                  {FEATURED_REVIEW.text}
                </p>
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
                <span
                  aria-hidden="true"
                  className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-lg font-semibold text-white ring-4 ring-white/10"
                >
                  {FEATURED_REVIEW.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-white">{FEATURED_REVIEW.name}</span>
                  <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <BadgeCheck className="size-4 text-amber-400" aria-hidden="true" />
                    Local Guide · {FEATURED_REVIEW.year}
                  </span>
                </span>
                <GoogleIcon className="size-6" />
              </figcaption>
            </div>
          </figure>

          <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item.label}
                className="flex flex-col justify-center rounded-card border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
              >
                <p className="font-display text-5xl font-medium text-white">{item.value}</p>
                <p className="mt-1 text-sm font-semibold tracking-wide text-zinc-400 uppercase">{item.label}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Review wall */}
      <section aria-labelledby="wall-heading" className="py-10 2xl:py-15">
        <Container>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">In their words</p>
              <h2
                id="wall-heading"
                className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl"
              >
                Real words from <span className="text-brand-500">real customers</span>
              </h2>
            </div>
            <p className="text-sm text-zinc-500">A selection from our Google listing.</p>
          </div>
        </Container>
        {/* Full width: the rows run edge to edge. */}
        <ReviewWall reviews={GOOGLE_REVIEWS} topics={REVIEW_TOPICS} total={total} />
      </section>

      <WriteReviewBand />
      <ContactBand />
    </>
  );
}
