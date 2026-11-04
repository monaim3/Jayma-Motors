import Link from "next/link";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

const VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700 shadow-sm",
  secondary: "bg-ink-950 text-white hover:bg-logo-black shadow-sm",
  outline: "border border-zinc-300 bg-white text-ink-900 hover:bg-zinc-50",
  "outline-light": "border border-white/40 bg-transparent text-white hover:bg-white/10",
  ghost: "text-ink-900 hover:bg-zinc-100",
  destructive: "bg-danger-600 text-white hover:bg-danger-700 shadow-sm",
  link: "text-brand-600 underline-offset-4 hover:underline px-0",
};

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "size-11",
};

export function buttonClasses({ variant = "primary", size = "md", className } = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-control font-semibold whitespace-nowrap transition-colors",
    "disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0",
    VARIANTS[variant],
    variant !== "link" && SIZES[size],
    className,
  );
}

/**
 * Button or link styled as a button. Pass `href` for navigation.
 * `loading` shows a spinner and disables the button (prevents double submits).
 */
export function Button({
  variant,
  size,
  className,
  loading = false,
  disabled,
  href,
  children,
  type = "button",
  ...props
}) {
  const classes = buttonClasses({ variant, size, className });

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Spinner className="size-4" label="Please wait" />}
      {children}
    </button>
  );
}
