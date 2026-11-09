"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { GoogleIcon } from "@/components/brand/GoogleIcon";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * "Write a review" call to action (#write, linked from the home reviews
 * section). The stars light up on hover; each opens Google's review box
 * (Google can't pre-select the rating, the customer picks it there).
 */
export function WriteReviewBand() {
  const [hover, setHover] = useState(0);
  const link = { href: SITE.googleWriteReviewUrl, target: "_blank", rel: "noopener noreferrer" };

  return (
    <section id="write" aria-labelledby="write-heading" className="scroll-mt-24">
      <Container className="py-10 2xl:py-15">
        <div className="relative isolate overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink-900 px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_90%_at_50%_120%,rgb(196_41_39/0.45),transparent_70%)]"
          />
          <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">Your turn</p>
          <h2
            id="write-heading"
            className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl"
          >
            Been to Jayma? <span className="text-brand-500">Tell others</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Your review helps other car owners in Dhaka find an honest workshop — and tells our team what we did well.
          </p>

          <div className="mt-8 flex justify-center gap-1 sm:gap-2" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <a
                key={n}
                {...link}
                aria-label={`Rate ${n} star${n > 1 ? "s" : ""} on Google`}
                onMouseEnter={() => setHover(n)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(0)}
                className="rounded-full p-1 transition-transform duration-200 hover:scale-125 focus-visible:scale-125"
              >
                <Star
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className={cn(
                    "size-10 transition-colors duration-200 sm:size-12",
                    n <= hover ? "fill-amber-400 text-amber-400" : "fill-transparent text-white/30",
                  )}
                />
              </a>
            ))}
          </div>

          <a
            {...link}
            className={buttonClasses({ size: "lg", className: "mt-8 bg-white text-ink-950 hover:bg-zinc-200" })}
          >
            <GoogleIcon className="size-5" />
            Write a review on Google
          </a>
        </div>
      </Container>
    </section>
  );
}
