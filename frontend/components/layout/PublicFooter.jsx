import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { FOOTER_LINKS, PUBLIC_NAV } from "@/lib/constants";
import { FALLBACK_SITE } from "@/lib/site";

/** @param site - business details from the public layout (Laravel settings). */
export function PublicFooter({ site = FALLBACK_SITE }) {
  return (
    <footer className="border-t border-white/10 bg-ink-950/60 text-zinc-400 backdrop-blur-sm">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo variant="white" className="h-14" />
          <p className="text-sm leading-relaxed">{site.description}</p>
          <p lang="bn" className="text-sm text-zinc-300">
            {site.taglineBn}
          </p>
        </div>

        <nav aria-label="Quick links">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="More">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">More</h2>
          <ul className="space-y-2 text-sm">
            {FOOTER_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">Contact</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
              <span>{site.address}</span>
            </li>
            <li>
              <a href={site.phoneHref} className="flex gap-3 hover:text-white">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
                {site.phone}
              </a>
            </li>
            {site.hotline && (
              <li>
                <a href={site.hotlineHref} className="flex gap-3 hover:text-white">
                  <Phone className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
                  {site.hotline} <span className="text-zinc-500">(hotline)</span>
                </a>
              </li>
            )}
            <li>
              <a href={`mailto:${site.email}`} className="flex gap-3 break-all hover:text-white">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="py-5 text-xs">
          <p>
            © {site.name}. Serving Dhaka since {site.since}. Independent multi-brand workshop — not affiliated with any
            car manufacturer.
          </p>
        </Container>
      </div>
    </footer>
  );
}
