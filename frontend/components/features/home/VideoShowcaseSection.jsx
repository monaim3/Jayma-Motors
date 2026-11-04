"use client";

import { Play, SprayCan, Warehouse, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { WORKSHOP_VIDEO } from "@/lib/home-content";
import { cn } from "@/lib/utils";
import { VideoModal } from "./VideoModal";

const FACTS = [
  { icon: Warehouse, title: "Spacious modern workshop", text: "Lifts, tools and room for every job" },
  { icon: SprayCan, title: "Dedicated paint booth", text: "Dust-free spraying for a clean finish" },
  { icon: Wrench, title: "Skilled team at work", text: "Every car handled with care" },
];

/**
 * Home: cinematic "Inside the workshop" band. A silent preview loop plays
 * blurred in the background and inside the card; clicking opens the full
 * video (with sound) in the custom player. Works for portrait reels and
 * landscape cards via WORKSHOP_VIDEO.cardAspect (the popup uses the real `aspect`).
 */
export function VideoShowcaseSection() {
  const sectionRef = useRef(null);
  const backdropRef = useRef(null);
  const cardRef = useRef(null);
  const [open, setOpen] = useState(false);
  const video = WORKSHOP_VIDEO;
  const cardAspect = video.cardAspect ?? video.aspect;
  const portrait = cardAspect < 1;

  // Play the silent previews only while the section is on screen.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const previews = [backdropRef.current, cardRef.current].filter(Boolean);
    const observer = new IntersectionObserver(
      ([entry]) => {
        for (const preview of previews) {
          if (entry.isIntersecting && !open) preview.play().catch(() => {});
          else preview.pause();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [open]);

  const previewProps = {
    src: video.preview,
    poster: video.poster,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "metadata",
    "aria-hidden": true,
    tabIndex: -1,
  };

  return (
    <section ref={sectionRef} aria-labelledby="workshop-heading" className="relative isolate overflow-hidden">
      {/* Ambient background: the preview, blurred and darkened, fading into the page. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]"
      >
        <video ref={backdropRef} {...previewProps} className="size-full scale-110 object-cover opacity-45 blur-2xl" />
        <div className="absolute inset-0 bg-ink-950/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_55%_at_50%_50%,rgb(196_41_39/0.18),transparent_70%)]" />
      </div>

      <Container
        className={cn(
          "grid items-center gap-10 py-10 2xl:py-15",
          portrait ? "lg:grid-cols-[1fr_auto_1fr] lg:gap-14" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-14",
        )}
      >
        <div className="text-center lg:text-left">
          <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">Inside the workshop</p>
          <h2
            id="workshop-heading"
            className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl"
          >
            See how we care <span className="text-brand-500">for your car</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-zinc-300 lg:mx-0">
            Take a {video.duration} tour of Jayma Motors — our team, our tools and the care that goes into every car.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-8 inline-flex h-12 items-center gap-3 rounded-full bg-brand-600 py-2 pr-6 pl-2 font-semibold text-white shadow-lg shadow-brand-900/40 transition-colors hover:bg-brand-700"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-white text-brand-600">
              <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
            </span>
            Watch the video
          </button>
        </div>

        {/* Video card: live silent preview + play button. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Play video: ${video.title}`}
          style={{ aspectRatio: cardAspect }}
          className={cn(
            "group relative mx-auto block w-full overflow-hidden rounded-[1.75rem] bg-ink-900 shadow-2xl ring-1 shadow-black/60 ring-white/15 transition-transform duration-500 hover:-translate-y-1",
            portrait ? "max-w-[20rem] lg:w-[22rem] lg:max-w-none" : "max-w-4xl",
          )}
        >
          <video ref={cardRef} {...previewProps} className="absolute inset-0 size-full object-cover" />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_top,rgb(14_14_16/0.9)_0%,transparent_40%,transparent_75%,rgb(14_14_16/0.4)_100%)] transition-colors duration-500 group-hover:bg-ink-950/20"
          />

          <span className="absolute inset-0 flex items-center justify-center">
            <span className="relative flex size-16 items-center justify-center sm:size-24">
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full bg-brand-600/40 [animation-duration:2s]"
              />
              <span className="relative flex size-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl ring-8 shadow-brand-900/60 ring-brand-600/25 transition-transform duration-300 group-hover:scale-110 sm:size-24">
                <Play className="ml-1 size-7 fill-current sm:ml-1.5 sm:size-10" aria-hidden="true" />
              </span>
            </span>
          </span>

          <span className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur sm:top-5 sm:left-5">
            <span className="size-2 animate-pulse rounded-full bg-brand-500" aria-hidden="true" />
            {video.duration}
          </span>
          <span className="absolute inset-x-0 bottom-0 p-4 text-left sm:p-6">
            <span className="block font-display text-base leading-tight text-white sm:text-2xl">{video.title}</span>
          </span>
        </button>

        <ul
          className={cn(
            "mx-auto grid w-full max-w-md gap-3 lg:mx-0",
            !portrait && "sm:max-w-none sm:grid-cols-3 lg:col-span-2",
          )}
        >
          {FACTS.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex items-center gap-4 rounded-card border border-white/10 bg-ink-950/50 p-4 backdrop-blur-md"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-600/15 text-brand-500 ring-1 ring-brand-500/30">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-bold text-white">{title}</span>
                <span className="block text-sm text-zinc-400">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>

      <VideoModal
        open={open}
        onClose={() => setOpen(false)}
        src={video.src}
        poster={video.poster}
        title={video.title}
        aspect={video.aspect}
      />
    </section>
  );
}
