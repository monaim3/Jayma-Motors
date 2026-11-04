import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/constants";

/** Thin contact bar shown above the main header (transparent; sits over the page hero). */
export function TopBar() {
  return (
    <div className="border-b border-white/10 text-sm text-zinc-300">
      <Container className="flex h-10 items-center justify-between gap-4">
        <a href={SITE.phoneHref} className="inline-flex items-center gap-2 hover:text-white">
          <Phone className="size-4 text-brand-500" aria-hidden="true" />
          {SITE.phone}
        </a>
        <div className="hidden items-center gap-6 md:flex">
          <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 hover:text-white">
            <Mail className="size-4 text-brand-500" aria-hidden="true" />
            {SITE.email}
          </a>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4 text-brand-500" aria-hidden="true" />
            Vatara, Dhaka
          </span>
          <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            Facebook
          </a>
        </div>
      </Container>
    </div>
  );
}
