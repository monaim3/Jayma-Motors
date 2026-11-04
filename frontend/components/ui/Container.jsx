import { cn } from "@/lib/utils";

/** Centered page container: max 1280px, 16px gutter on mobile (Step 5 §2.5). */
export function Container({ as: Tag = "div", className, children }) {
  return <Tag className={cn("mx-auto w-full max-w-site px-4 sm:px-6 lg:px-8", className)}>{children}</Tag>;
}
