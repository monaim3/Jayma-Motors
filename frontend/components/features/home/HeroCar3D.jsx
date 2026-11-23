"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { preload } from "react-dom";
import { cn } from "@/lib/utils";
import { HeroCar } from "./HeroCar";

const MODEL_URL = "/models/car.glb";

let canRender3DCache = null;
/** WebGL available and the visitor hasn't asked to save data. Checked once. */
function canRender3D() {
  if (canRender3DCache === null) {
    try {
      const canvas = document.createElement("canvas");
      const webgl = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
      canRender3DCache = webgl && !navigator.connection?.saveData;
    } catch {
      canRender3DCache = false;
    }
  }
  return canRender3DCache;
}
const subscribeNoop = () => () => {};
const getCanRender3DOnServer = () => true;

/**
 * 3D scroll-assembled car (three.js). The model download starts with the page
 * (preload) and the scene loads in the browser only; a poster still of the
 * opening scene shows meanwhile and crossfades into the live car. The line-art
 * car is only for devices without WebGL or with data saving on.
 *
 * @param getProgress - returns the current scroll progress; the scene reads it
 *   every frame, so scrolling doesn't re-render React.
 * @param fallbackProgress - progress for the line-art fallback (updates per stage).
 */
export function HeroCar3D({ getProgress, getFreeArea, fallbackProgress, className }) {
  const canvasRef = useRef(null);
  const getProgressRef = useRef(getProgress);
  const getFreeAreaRef = useRef(getFreeArea);
  const [ready, setReady] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const supported = useSyncExternalStore(subscribeNoop, canRender3D, getCanRender3DOnServer);

  // Fetch the 3.2 MB model alongside the page instead of after the JS loads.
  preload(MODEL_URL, { as: "fetch", crossOrigin: "anonymous" });

  useEffect(() => {
    getProgressRef.current = getProgress;
    getFreeAreaRef.current = getFreeArea;
  }, [getProgress, getFreeArea]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !supported) return;

    let scene;
    let cancelled = false;
    let visible = true;
    // Weak devices only: phones in general get the sharp render (their screens show blur most).
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;

    import("./car-scene").then(({ CarScene }) => {
      if (cancelled) return;
      scene = new CarScene(canvas, {
        lowPower,
        getTarget: () => getProgressRef.current(),
        getFreeArea: () => getFreeAreaRef.current?.(),
        onReady: () => setReady(true),
      });
      if (visible) scene.start();
    });

    const resizeObserver = new ResizeObserver(() => scene?.resize());
    resizeObserver.observe(canvas);

    // Render only while the hero is on screen.
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) scene?.start();
      else scene?.stop();
    });
    visibility.observe(canvas);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      visibility.disconnect();
      scene?.dispose();
    };
  }, [supported]);

  // Fills its positioned parent (the whole hero stage); the car is framed beside
  // the text on desktop and below it on phones by the scene's camera offset.
  return (
    <div className={cn("absolute inset-0", className)}>
      {supported ? (
        <>
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn(
              "absolute inset-0 size-full transition-opacity duration-1000 ease-out",
              ready ? "opacity-100" : "opacity-0",
            )}
          />
          {/*
            Poster: a still of this exact opening scene (floating parts), shown
            instantly and crossfaded into the live 3D once it is ready. Captured
            from the scene by scripts (wide ≥1024px = desktop camera, tall = phones).
          */}
          {showPoster && (
            <picture
              className={cn(
                "pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-out",
                ready ? "opacity-0" : "opacity-100",
              )}
              onTransitionEnd={() => ready && setShowPoster(false)}
            >
              <source media="(min-width: 1024px)" srcSet="/images/hero/hero-poster-desktop.webp" />
              {/* Plain <img> inside an art-directed <picture>; the files are already optimised WebP. */}
              <img
                src="/images/hero/hero-poster-mobile.webp"
                alt=""
                fetchPriority="high"
                decoding="async"
                className="size-full object-cover"
              />
            </picture>
          )}
        </>
      ) : (
        <div className="absolute inset-x-4 bottom-[6%] lg:inset-x-auto lg:top-1/2 lg:right-[4%] lg:bottom-auto lg:w-[52%] lg:-translate-y-1/2">
          <HeroCar progress={fallbackProgress} />
        </div>
      )}
    </div>
  );
}
