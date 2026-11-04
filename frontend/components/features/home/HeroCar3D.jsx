"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { HeroCar } from "./HeroCar";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * 3D scroll-assembled car (three.js). Loads only in the browser, after the
 * page is visible; the line-art car is shown until the 3D model is ready and
 * stays as the fallback when WebGL is unavailable or data saving is on.
 */
export function HeroCar3D({ progress, className }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const saveData = navigator.connection?.saveData;
    if (!canvas || saveData || !supportsWebGL()) return;

    let scene;
    let cancelled = false;
    const lowPower = window.matchMedia("(max-width: 767px)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;

    import("./car-scene").then(({ CarScene }) => {
      if (cancelled) return;
      scene = new CarScene(canvas, { lowPower, onReady: () => setReady(true) });
      sceneRef.current = scene;
    });

    const resizeObserver = new ResizeObserver(() => scene?.resize());
    resizeObserver.observe(canvas);

    // Render only while the hero is on screen.
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) scene?.start();
      else scene?.stop();
    });
    visibility.observe(canvas);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      visibility.disconnect();
      scene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.setProgress(progress);
    scene.start();
  }, [progress, ready]);

  // Fills its positioned parent (the whole hero stage); the car is framed beside
  // the text on desktop and below it on phones by the scene's camera offset.
  return (
    <div className={cn("absolute inset-0", className)}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 size-full transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "absolute inset-x-4 bottom-[6%] transition-opacity duration-700 lg:inset-x-auto lg:top-1/2 lg:right-[4%] lg:bottom-auto lg:w-[52%] lg:-translate-y-1/2",
          ready ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        <HeroCar progress={progress} />
      </div>
    </div>
  );
}
