import { AlertTriangle, ArrowRight, CalendarCheck, CheckCircle2, Clock, Lightbulb, Phone } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { categoryLabel, PostCard } from "@/components/features/blog/PostCard";
import { ReadingProgress } from "@/components/features/blog/ReadingProgress";
import { ContactBand } from "@/components/features/home/ContactBand";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { BLOG_POSTS, formatPostDate, headingId } from "@/lib/blog-posts";
import { SITE } from "@/lib/constants";
import { HOME_SERVICES } from "@/lib/home-content";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

const getPost = (slug) => BLOG_POSTS.find((post) => post.slug === slug);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: "article", publishedTime: post.date, images: [post.image.src] },
  };
}

/** One body block. Headings get ids for the "On this page" list. */
function Block({ block }) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          id={headingId(block.text)}
          className="scroll-mt-28 pt-6 font-display text-2xl font-medium text-white sm:text-3xl"
        >
          {block.text}
        </h2>
      );
    case "ul":
      return (
        <ul className="space-y-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3">
              <CheckCircle2 className="mt-1 size-4 shrink-0 text-brand-500" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="space-y-3">
          {block.items.map((item, i) => (
            <li key={item} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600/15 text-sm font-bold text-brand-500 ring-1 ring-brand-500/30">
                {i + 1}
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      );
    case "warn":
      return (
        <p className="flex gap-3 rounded-card border border-amber-400/30 bg-amber-400/[0.07] p-5 text-amber-100">
          <AlertTriangle className="mt-1 size-5 shrink-0 text-amber-400" aria-hidden="true" />
          <span>
            <strong className="text-amber-300">Warning: </strong>
            {block.text}
          </span>
        </p>
      );
    case "tip":
      return (
        <p className="flex gap-3 rounded-card border border-brand-500/30 bg-brand-600/[0.08] p-5 text-zinc-200">
          <Lightbulb className="mt-1 size-5 shrink-0 text-brand-500" aria-hidden="true" />
          <span>
            <strong className="text-white">Jayma tip: </strong>
            {block.text}
          </span>
        </p>
      );
    default:
      return <p>{block.text}</p>;
  }
}

/** Blog article (Step 5 §6.7): hero with photo, takeaways, body, service CTA, more articles. */
export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const service = HOME_SERVICES.find((item) => item.slug === post.service);
  const headings = post.body.filter((block) => block.type === "h2");
  const more = [
    ...BLOG_POSTS.filter((p) => p.slug !== slug && p.category === post.category),
    ...BLOG_POSTS.filter((p) => p.slug !== slug && p.category !== post.category),
  ].slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: new URL(post.image.src, SITE.url).toString(),
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: new URL(`/blog/${slug}`, SITE.url).toString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Static content from our own code, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress targetId="article-body" />

      <PageHero
        eyebrow={categoryLabel(post.category)}
        title={post.title}
        intro={post.excerpt}
        crumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
        aside={
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[1.5rem] shadow-2xl ring-1 shadow-black/60 ring-white/15 lg:mr-0">
            <Image
              src={post.image.src}
              alt={post.image.alt}
              fill
              priority
              quality={90}
              sizes="(min-width: 640px) 384px, 100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent" />
          </div>
        }
      >
        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
          <span className="font-semibold text-zinc-200">By the {SITE.name} team</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" />
            {post.readMins} min read
          </span>
        </p>
      </PageHero>

      <Container className="grid gap-10 pb-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 2xl:pb-15">
        <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          <nav aria-label="On this page" className="rounded-card border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">On this page</p>
            <ol className="mt-3 space-y-2 text-sm">
              {headings.map((heading) => (
                <li key={heading.text}>
                  <a
                    href={`#${headingId(heading.text)}`}
                    className="block text-zinc-300 transition-colors hover:text-brand-500"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article id="article-body" className="max-w-3xl">
          <div className="rounded-[1.25rem] bg-gradient-to-br from-brand-500/60 via-white/10 to-white/5 p-px">
            <div className="rounded-[calc(1.25rem-1px)] bg-ink-900 p-6 sm:p-7">
              <p className="text-xs font-semibold tracking-widest text-brand-500 uppercase">Quick takeaways</p>
              <ul className="mt-4 space-y-3">
                {post.takeaways.map((item) => (
                  <li key={item} className="flex gap-3 text-zinc-200">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 space-y-5 text-[17px] leading-8 text-zinc-300">
            {post.body.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>

          {service && (
            <div className="mt-12 flex flex-col gap-6 rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-brand-600/20 to-transparent p-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest text-brand-500 uppercase">Need a hand?</p>
                <p className="mt-1 font-display text-2xl font-medium text-white">{service.name}</p>
                <p className="mt-1 text-sm text-zinc-400">{service.text}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Button href={`/services/${service.slug}`}>
                  <CalendarCheck aria-hidden="true" />
                  View service
                </Button>
                <Button href={SITE.phoneHref} variant="outline-light">
                  <Phone aria-hidden="true" />
                  Call us
                </Button>
              </div>
            </div>
          )}
        </article>
      </Container>

      <section aria-labelledby="more-heading">
        <Container className="py-10 2xl:py-15">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 id="more-heading" className="font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl">
              Keep <span className="text-brand-500">reading</span>
            </h2>
            <Button href="/blog" variant="outline-light">
              All articles
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((item, i) => (
              // Third card only where it fits the row (phone list and 3-column laptops).
              <li key={item.slug} className={i === 2 ? "sm:max-lg:hidden" : undefined}>
                <PostCard post={item} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <ContactBand />
    </>
  );
}
