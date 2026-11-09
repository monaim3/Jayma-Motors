import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { FOOTER_LINKS, PUBLIC_NAV, SITE } from "@/lib/constants";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink-950/60 text-zinc-400 backdrop-blur-sm">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo variant="white" className="h-14" />
          <p className="text-sm leading-relaxed">{SITE.description}</p>
          <p lang="bn" className="text-sm text-zinc-300">
            {SITE.taglineBn}
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
              <span>{SITE.address}</span>
            </li>
            <li>
              <a href={SITE.phoneHref} className="flex gap-3 hover:text-white">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={SITE.hotlineHref} className="flex gap-3 hover:text-white">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
                {SITE.hotline} <span className="text-zinc-500">(hotline)</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex gap-3 break-all hover:text-white">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {SITE.name}. Serving Dhaka since {SITE.since}. Independent multi-brand workshop — not affiliated
            with any car manufacturer.
          </p>
          <p className="text-zinc-500">
            3D car model:{" "}
            <a
              href="https://sketchfab.com/3d-models/2010-mercedes-sls-amg-fa3fd5eeea674f37bb03283f2c53d563"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              “2010 Mercedes SLS AMG”
            </a>{" "}
            by{" "}
            <a
              href="https://sketchfab.com/Tyler_Dave"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              Dave Love
            </a>
            ,{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              CC BY 4.0
            </a>
            , modified.
          </p>
          <Link href="/admin/login" className="hover:text-white">
            Management login
          </Link>
        </Container>
      </div>
    </footer>
  );
}
