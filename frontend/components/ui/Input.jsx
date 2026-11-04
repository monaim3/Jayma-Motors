import { cn } from "@/lib/utils";

export const controlClasses = cn(
  "block w-full rounded-control border border-zinc-300 bg-white px-3.5 text-base text-ink-900 sm:text-sm",
  "placeholder:text-zinc-400 transition-colors",
  "focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20",
  "disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500",
  "aria-invalid:border-danger-600 aria-invalid:focus:ring-danger-600/20",
);

export function Input({ className, ...props }) {
  return <input className={cn(controlClasses, "h-11", className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }) {
  return <textarea rows={rows} className={cn(controlClasses, "py-2.5", className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(controlClasses, "h-11 pr-9", className)} {...props}>
      {children}
    </select>
  );
}
