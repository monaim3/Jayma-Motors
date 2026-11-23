import { MessageCircleQuestion, Plus } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getSite } from "@/lib/api/content";
import { HOME_FAQS } from "@/lib/home-content";

/** FAQPage structured data so search engines can show the answers. */
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

/**
 * Home: frequently asked questions. Native <details> accordions — works
 * without JavaScript and with the keyboard. The first one starts open.
 */
export async function FaqSection() {
  const site = await getSite();
  return (
    <section aria-labelledby="faq-heading">
      <script
        type="application/ld+json"
        // Static content from our own file, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16 2xl:py-15">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-sm font-semibold tracking-widest text-brand-500 uppercase">FAQ</p>
          <h2 id="faq-heading" className="mt-2 font-display text-4xl leading-[1.1] font-medium text-white sm:text-5xl">
            Questions? <span className="text-brand-500">We&apos;ve got answers</span>
          </h2>
          <div className="mt-8 rounded-card border border-white/10 bg-surface p-6 backdrop-blur-sm">
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-600/15 text-brand-500 ring-1 ring-brand-500/30">
              <MessageCircleQuestion className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-bold text-white">Still have a question?</p>
            <p className="mt-1 text-sm text-zinc-400">Talk to our team — we reply quickly on call and WhatsApp.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={site.phoneHref} size="sm">
                Call {site.phone}
              </Button>
              <Button
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline-light"
                size="sm"
              >
                <WhatsAppIcon className="size-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {HOME_FAQS.map((faq, index) => (
            <details
              key={faq.q}
              open={index === 0}
              className="group rounded-card border border-white/10 bg-surface backdrop-blur-sm transition-colors open:border-brand-500/40 open:bg-white/[0.05]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-bold text-white sm:p-6 sm:text-lg [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-brand-500 transition duration-300 group-open:rotate-45 group-open:border-brand-500 group-open:bg-brand-600 group-open:text-white">
                  <Plus className="size-4" aria-hidden="true" />
                </span>
              </summary>
              <p className="-mt-1 px-5 pb-5 leading-relaxed text-zinc-400 sm:px-6 sm:pb-6">{faq.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
