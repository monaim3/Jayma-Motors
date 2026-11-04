"use client";

import { useEffect, useRef } from "react";

// LED bar grid (CSS px).
const CELL_W = 8;
const CELL_H = 22;
const GAP_X = 7;
const GAP_Y = 8;
const RADIUS = 4;
/** Spotlight radius around the pointer. */
const REACH = 130;
const LIT_ALPHA = 0.7;
const EASE = 0.14;
const LIT_RGB = "224 64 62"; // brand-500

/**
 * Site background effect: rounded LED bars that light up in brand red around
 * the mouse and fade out as it moves away (invisible at rest). Off on touch
 * screens and for reduced-motion visitors. Drawn on one fixed canvas; the
 * loop only runs while something is changing.
 */
export function LedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return;

    // Hover-only effect: nothing to draw on touch screens or with reduced motion.
    const interactive =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!interactive) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let offsetX = 0;
    let offsetY = 0;
    let levels = new Float32Array(0);
    let pointer = null;
    let frame = 0;

    const cellPath = (target, x, y) => {
      target.beginPath();
      target.roundRect(x, y, CELL_W, CELL_H, RADIUS);
      target.fill();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil((width + GAP_X) / (CELL_W + GAP_X)) + 1;
      rows = Math.ceil((height + GAP_Y) / (CELL_H + GAP_Y)) + 1;
      offsetX = (width - (cols * (CELL_W + GAP_X) - GAP_X)) / 2;
      offsetY = (height - (rows * (CELL_H + GAP_Y) - GAP_Y)) / 2;
      levels = new Float32Array(cols * rows);
      draw();
    };

    /** Eases every bar toward its target; returns true while still changing. */
    const step = () => {
      let changing = false;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col;
          let target = 0;
          if (pointer) {
            const dx = offsetX + col * (CELL_W + GAP_X) + CELL_W / 2 - pointer.x;
            const dy = offsetY + row * (CELL_H + GAP_Y) + CELL_H / 2 - pointer.y;
            const falloff = 1 - Math.hypot(dx, dy) / REACH;
            if (falloff > 0) target = falloff * falloff;
          }
          const next = levels[index] + (target - levels[index]) * EASE;
          if (Math.abs(target - next) > 0.004) changing = true;
          levels[index] = Math.abs(target - next) > 0.004 ? next : target;
        }
      }
      return changing;
    };

    function draw() {
      context.clearRect(0, 0, width, height);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const level = levels[row * cols + col];
          if (level < 0.01) continue;
          context.fillStyle = `rgb(${LIT_RGB} / ${(level * LIT_ALPHA).toFixed(3)})`;
          cellPath(context, offsetX + col * (CELL_W + GAP_X), offsetY + row * (CELL_H + GAP_Y));
        }
      }
    }

    const tick = () => {
      const changing = step();
      draw();
      frame = changing ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (event) => {
      pointer = { x: event.clientX, y: event.clientY };
      wake();
    };
    const onLeave = () => {
      pointer = null;
      wake();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />;
}
