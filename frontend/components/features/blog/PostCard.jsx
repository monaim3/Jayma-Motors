import { ArrowUpRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BLOG_CATEGORIES, formatPostDate } from "@/lib/blog-posts";

export const categoryLabel = (slug) => BLOG_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

/** Blog card: photo with category pill, date · read time, title, excerpt. The whole card is the link. */
export function PostCard({ post, priority = false }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-[0_18px_40px_rgb(196_41_39/0.18)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={post.image.src}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
        <span className="absolute top-4 left-4 rounded-full bg-ink-950/75 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur">
          {categoryLabel(post.category)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-2 text-xs text-zinc-500">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <Clock className="size-3.5" aria-hidden="true" />
          {post.readMins} min read
        </p>
        <h3 className="mt-3 text-xl leading-snug font-bold text-white transition-colors group-hover:text-brand-500">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-400">{post.excerpt}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500">
          Read article
          <ArrowUpRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </article>
  );
}
