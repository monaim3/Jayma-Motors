import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BlogGrid } from "@/components/features/blog/BlogGrid";
import { categoryLabel } from "@/components/features/blog/PostCard";
import { ContactBand } from "@/components/features/home/ContactBand";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { BLOG_CATEGORIES, BLOG_POSTS, formatPostDate } from "@/lib/blog-posts";

export const metadata = {
  title: "Car Care Tips & Advice",
  description:
    "Practical car-care advice for Dhaka drivers from Jayma Motors' technicians — monsoon driving, engine oil, brakes, batteries, AC and paint care.",
  alternates: { canonical: "/blog" },
};

/** Blog (Step 5 §6.7): latest post featured, the rest in a filterable grid. Posts from lib/blog-posts until the posts API. */
export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="Car care tips"
        title={
          <>
            Know your car, <span className="text-brand-500">save money</span>
          </>
        }
        intro="Straight advice from our technicians for Dhaka's roads — spot problems early, avoid costly repairs and drive safer."
        crumbs={[{ label: "Blog" }]}
      />

      {/* Featured: latest article */}
      <section aria-labelledby="featured-heading">
        <Container className="pb-10 2xl:pb-15">
          <h2 id="featured-heading" className="sr-only">
            Latest article
          </h2>
          <article className="group relative grid overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink-900 transition duration-300 hover:border-brand-500/40 lg:grid-cols-2">
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[26rem]">
              <Image
                src={featured.image.src}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent lg:bg-gradient-to-l"
              />
            </div>
            <div className="relative flex flex-col justify-center p-7 sm:p-10">
              <div
                aria-hidden="true"
                className="absolute -top-20 -right-20 size-64 rounded-full bg-brand-600/20 blur-3xl"
              />
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full bg-brand-600 px-3 py-1 font-semibold tracking-widest text-white uppercase">
                  Latest
                </span>
                <span className="rounded-full px-3 py-1 font-semibold text-zinc-300 ring-1 ring-white/15">
                  {categoryLabel(featured.category)}
                </span>
              </div>
              <h3 className="mt-5 font-display text-3xl leading-tight font-medium text-white sm:text-4xl">
                <Link href={`/blog/${featured.slug}`} className="after:absolute after:inset-0">
                  {featured.title}
                </Link>
              </h3>
              <p className="mt-4 leading-relaxed text-zinc-400">{featured.excerpt}</p>
              <p className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
                <time dateTime={featured.date}>{formatPostDate(featured.date)}</time>
                <span aria-hidden="true">·</span>
                <Clock className="size-4" aria-hidden="true" />
                {featured.readMins} min read
              </p>
              <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-control bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-brand-700">
                Read article
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </div>
          </article>
        </Container>
      </section>

      {/* All articles */}
      <section aria-labelledby="all-heading">
        <Container className="py-10 2xl:py-15">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">More articles</p>
            <h2
              id="all-heading"
              className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl"
            >
              Tips for every <span className="text-brand-500">season</span>
            </h2>
          </div>
          <BlogGrid posts={rest} categories={BLOG_CATEGORIES} />
        </Container>
      </section>

      <ContactBand />
    </>
  );
}
