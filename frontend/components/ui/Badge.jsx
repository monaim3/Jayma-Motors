import { STATUS_TONES } from "@/lib/constants";
import { cn, humanize } from "@/lib/utils";

const TONES = {
  warning: "bg-warning-50 text-warning-700 ring-warning-500/30",
  info: "bg-info-50 text-info-700 ring-info-600/20",
  violet: "bg-violet-50 text-violet-600 ring-violet-600/20",
  success: "bg-success-50 text-success-700 ring-success-600/20",
  danger: "bg-danger-50 text-danger-700 ring-danger-600/20",
  brand: "bg-brand-50 text-brand-700 ring-brand-600/20",
  neutral: "bg-zinc-100 text-zinc-600 ring-zinc-500/20",
  outline: "bg-white text-zinc-600 ring-zinc-300",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Status badge: colour from Step 5 §2.3, always with a text label. */
export function StatusBadge({ status, className }) {
  return (
    <Badge tone={STATUS_TONES[status] ?? "neutral"} className={className}>
      {humanize(status)}
    </Badge>
  );
}
