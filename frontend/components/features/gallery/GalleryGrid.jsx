"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const subscribeNoop = () => () => {};

/**
 * Gallery (Step 5 §6.5): album filter chips, photo grid, and a lightbox with
 * keyboard (← → Esc) and swipe navigation, captions and a counter.
 */
export function GalleryGrid({ albums, photos }) {
  const [album, setAlbum] = useState("all");
  const [index, setIndex] = useState(null); // index into `shown`; null = closed
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const closeRef = useRef(null);
  const openerRef = useRef(null);
  const swipeStart = useRef(null);

  const shown = album === "all" ? photos : photos.filter((photo) => photo.album === album);
  const open = index !== null;
  const current = open ? shown[index] : null;

  const step = useCallback((delta) => setIndex((i) => (i + delta + shown.length) % shown.length), [shown.length]);
  const close = () => setIndex(null);

  useEffect(() => {
    if (!open) return;
    const opener = openerRef.current;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") setIndex(null);
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus();
    };
  }, [open, step]);

  const counts = Object.fromEntries(albums.map((a) => [a.slug, photos.filter((p) => p.album === a.slug).length]));
  const chips = [{ slug: "all", label: "All", count: photos.length }, ...albums.map((a) => ({ ...a, count: counts[a.slug] }))];

  return (
    <>
      <div role="group" aria-label="Filter by album" className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.slug}
            type="button"
            onClick={() => setAlbum(chip.slug)}
            aria-pressed={album === chip.slug}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              album === chip.slug
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-white/15 text-zinc-300 hover:border-brand-500/60 hover:text-white",
            )}
          >
            {chip.label} <span className={album === chip.slug ? "text-white/70" : "text-zinc-500"}>{chip.count}</span>
          </button>
        ))}
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((photo, i) => (
          <li key={photo.src}>
            <button
              type="button"
              onClick={(event) => {
                openerRef.current = event.currentTarget;
                setIndex(i);
              }}
              aria-label={`Open photo: ${photo.caption}`}
              className="group relative block aspect-[3/4] w-full overflow-hidden rounded-card ring-1 ring-white/10"
            >
              <Image
                src={photo.src}
                alt={photo.caption}
                fill
                priority={i < 4}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100"
              />
              <span className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-ink-950/70 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                <Expand className="size-4" aria-hidden="true" />
              </span>
              <span className="absolute inset-x-0 bottom-0 p-3 text-left text-sm font-semibold text-white sm:p-4">
                {photo.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {isClient &&
        open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-sm"
            onPointerDown={(event) => (swipeStart.current = event.clientX)}
            onPointerUp={(event) => {
              if (swipeStart.current === null) return;
              const dx = event.clientX - swipeStart.current;
              swipeStart.current = null;
              if (dx < -50) step(1);
              else if (dx > 50) step(-1);
            }}
          >
            <div className="flex items-center justify-between p-4 text-sm text-zinc-300">
              <span className="tabular-nums">
                {index + 1} / {shown.length}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex size-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </div>

            {/* Click on the dark backdrop (not the photo) closes. */}
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4" onClick={(e) => e.target === e.currentTarget && close()}>
              <figure className="relative flex h-full max-h-full flex-col items-center justify-center">
                <div className="relative aspect-[9/16] h-full max-h-[calc(100dvh-10rem)] max-w-full">
                  <Image
                    key={current.src}
                    src={current.src}
                    alt={current.caption}
                    fill
                    sizes="(min-height: 900px) 480px, 60vh"
                    className="animate-[hero-fade_300ms_ease-out] rounded-card object-contain select-none"
                    draggable={false}
                  />
                </div>
                <figcaption className="mt-3 text-center font-semibold text-white">{current.caption}</figcaption>
                <p className="mt-1 text-xs text-zinc-500 sm:hidden">Swipe for more</p>
              </figure>

              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute left-2 hidden size-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-600 sm:left-6 sm:flex"
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute right-2 hidden size-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-600 sm:right-6 sm:flex"
              >
                <ChevronRight className="size-6" aria-hidden="true" />
              </button>
            </div>
            <div className="h-6 shrink-0" />
          </div>,
          document.body,
        )}
    </>
  );
}
