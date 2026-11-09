"use client";

import { useState } from "react";
import { PostCard } from "@/components/features/blog/PostCard";
import { cn } from "@/lib/utils";

/** Blog list: category filter chips (with counts) over the post grid. */
export function BlogGrid({ posts, categories }) {
  const [category, setCategory] = useState("all");
  const shown = category === "all" ? posts : posts.filter((post) => post.category === category);
  const chips = [
    { slug: "all", label: "All", count: posts.length },
    ...categories
      .map((c) => ({ ...c, count: posts.filter((post) => post.category === c.slug).length }))
      .filter((c) => c.count > 0),
  ];

  return (
    <>
      <div role="group" aria-label="Filter articles by topic" className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.slug}
            type="button"
            onClick={() => setCategory(chip.slug)}
            aria-pressed={category === chip.slug}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              category === chip.slug
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-white/15 text-zinc-300 hover:border-brand-500/60 hover:text-white",
            )}
          >
            {chip.label}{" "}
            <span className={category === chip.slug ? "text-white/70" : "text-zinc-500"}>{chip.count}</span>
          </button>
        ))}
      </div>

      <ul key={category} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((post, i) => (
          <li
            key={post.slug}
            style={{ animationDelay: `${i * 70}ms` }}
            className="motion-safe:animate-[hero-fade_500ms_ease-out_both]"
          >
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </>
  );
}
