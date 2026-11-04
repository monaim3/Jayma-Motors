import { CalendarCheck, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import Link from "next/link";
import { SITE } from "@/lib/constants";

/**
 * WhatsApp + Call buttons (bottom-right) and the sticky "Book Appointment"
 * bar on mobile (Step 5 §4.1).
 */
export function FloatingContact() {
  return (
    <>
      <div className="fixed right-4 bottom-20 z-30 flex flex-col gap-3 lg:bottom-6">
        <a
          href={SITE.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
        >
          <WhatsAppIcon className="size-7" />
        </a>
        <a
          href={SITE.phoneHref}
          aria-label={`Call ${SITE.phone}`}
          className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105"
        >
          <Phone className="size-5" aria-hidden="true" />
        </a>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink-950/85 p-3 backdrop-blur-md lg:hidden">
        <Link
          href="/book-appointment"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-control bg-brand-600 text-sm font-semibold text-white"
        >
          <CalendarCheck className="size-4" aria-hidden="true" />
          Book Appointment
        </Link>
      </div>
    </>
  );
}
