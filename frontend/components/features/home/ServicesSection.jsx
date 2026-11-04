import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HOME_SERVICES } from "@/lib/home-content";

/**
 * Home section 3 (Step 5 §6.1): featured services as photo cards.
 * Photos are free Unsplash stock (public/images/services) until the owner's workshop photos arrive.
 */
export function ServicesSection() {
  return (
    <section aria-labelledby="services-heading">
      <Container className="py-10 2xl:py-15">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">Our services</p>
            <h2
              id="services-heading"
              className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl"
            >
              Everything your car needs, under one roof
            </h2>
          </div>
          <Button href="/services" variant="outline-light" className="shrink-0 self-start sm:self-auto">
            View all services
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_SERVICES.map((service) => {
            return (
              <li key={service.slug}>
                <article className="group relative isolate flex aspect-[5/4] flex-col justify-end overflow-hidden rounded-card bg-ink-900 text-white shadow-xl ring-1 shadow-black/40 ring-white/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-900/40 hover:ring-brand-500/40 sm:aspect-[4/5]">
                  <Image
                    src={`/images/services/${service.slug}.jpg`}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Dark fade for readable text; turns brand red on hover. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--color-ink-950)_0%,rgb(14_14_16/0.55)_30%,transparent_60%)]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-900/90 via-brand-900/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <div className="p-6">
                    <h3 className="font-display text-2xl leading-tight font-medium text-white">
                      {/* Stretched link: the whole card opens the service page. */}
                      <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0">
                        {service.name}
                      </Link>
                    </h3>
                    <div className="mt-3 flex justify-end">
                      {/* Sits above the stretched link; the booking form picks the service from the hash. */}
                      <a
                        href={`#book-${service.slug}`}
                        aria-label={`Book ${service.name}`}
                        className="relative z-10 inline-flex items-center gap-1.5 text-base font-bold text-brand-500 transition-colors hover:text-white"
                      >
                        Book Now
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
