import { cn } from "@/lib/utils";

export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-control bg-zinc-200/70", className)} />;
}

/** Generic page placeholder used by loading.js files. */
export function PageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
