import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Star rating, read out as "4.2 out of 5 stars". Fractional ratings fill the
 * last star partly (a clipped gold row over a faint row).
 */
export function Stars({ rating, className, starClassName = "size-4" }) {
  const row = (filled) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        aria-hidden="true"
        className={cn(
          "shrink-0",
          starClassName,
          filled ? "fill-amber-400 text-amber-400" : "fill-white/15 text-white/15",
        )}
      />
    ));

  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className={cn("relative inline-flex", className)}>
      <span className="flex gap-0.5">{row(false)}</span>
      <span className="absolute inset-0 flex gap-0.5 overflow-hidden" style={{ width: `${(rating / 5) * 100}%` }}>
        {row(true)}
      </span>
    </span>
  );
}
