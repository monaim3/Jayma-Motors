"use client";

import { useEffect, useRef } from "react";

/**
 * Thin red bar along the top edge showing how far through the article you
 * are. Updates the transform directly (no React re-render per scroll).
 */
export function ReadingProgress({ targetId }) {
  const barRef = useRef(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 1;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[45] h-1">
      <div
        ref={barRef}
        // Inline transform (not Tailwind's scale-x-0, which uses the separate `scale` property).
        style={{ transform: "scaleX(0)" }}
        className="h-full origin-left bg-gradient-to-r from-brand-700 via-brand-500 to-amber-400"
      />
    </div>
  );
}
