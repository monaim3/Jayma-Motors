import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, letting later classes override earlier ones. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** "in_progress" → "In progress" */
export function humanize(value) {
  if (!value) return "";
  const text = String(value).replace(/[_-]+/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
