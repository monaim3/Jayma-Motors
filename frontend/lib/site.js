import { SITE } from "./constants";
import { HOME_SERVICES, OPENING_HOURS } from "./home-content";
import { SERVICE_DETAILS } from "./service-details";

/**
 * Shapes shared by the API data layer (lib/api/content.js) and its built-in
 * fallback. Components receive the same shape either way.
 *
 * site:    SITE (fixed details) + editable contact details from GET /settings/public
 * service: { slug, name, icon, text, duration, isBookable, photo, headline, descriptionHtml, included, signs, faqs, meta }
 */

/** +8801711949110 → "01711-949110" */
export function displayPhone(normalized) {
  if (!normalized) return null;
  const local = `0${normalized.replace(/^\+?880/, "")}`;
  return `${local.slice(0, 5)}-${local.slice(5)}`;
}

const telHref = (normalized) => (normalized ? `tel:${normalized}` : null);
const waHref = (normalized) => (normalized ? `https://wa.me/${normalized.replace(/\D/g, "")}` : null);

/** Built-in site details, used when the API can't be reached. */
export const FALLBACK_SITE = {
  ...SITE,
  whatsapp: SITE.phone,
  phones: [
    { label: "Main", display: SITE.phone, href: SITE.phoneHref },
    { label: "Hotline", display: SITE.hotline, href: SITE.hotlineHref },
  ],
  openingHours: OPENING_HOURS,
  mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${SITE.geo.lat},${SITE.geo.lng}`,
  quickButtons: { emergencyHref: SITE.phoneHref, pickDropHref: SITE.whatsappHref },
};

/**
 * GET /settings/public → the site object. The first phone is the main number,
 * the second (if any) the hotline. Fixed details (url, since, taglines, map pin) stay from SITE.
 */
export function siteFromSettings(settings) {
  const business = settings?.business ?? {};
  const phones = (business.phones ?? []).map((phone) => ({
    label: phone.label,
    display: displayPhone(phone.number),
    href: telHref(phone.number),
  }));
  const [main, hotline] = phones;
  const social = Object.fromEntries(Object.entries(settings?.social ?? {}).filter(([, url]) => url));

  return {
    ...FALLBACK_SITE,
    name: business.name ?? SITE.name,
    address: business.address ?? SITE.address,
    email: business.email ?? SITE.email,
    phone: main?.display ?? SITE.phone,
    phoneHref: main?.href ?? SITE.phoneHref,
    hotline: hotline?.display ?? null,
    hotlineHref: hotline?.href ?? null,
    whatsapp: displayPhone(business.whatsapp) ?? SITE.phone,
    whatsappHref: waHref(business.whatsapp) ?? SITE.whatsappHref,
    phones: phones.length ? phones : FALLBACK_SITE.phones,
    openingHours: business.opening_hours ?? OPENING_HOURS,
    mapsUrl: business.google_maps_url || FALLBACK_SITE.mapsUrl,
    social,
    description: settings?.seo?.default_description ?? SITE.description,
    quickButtons: {
      emergencyHref: telHref(settings?.quick_buttons?.emergency_phone) ?? SITE.phoneHref,
      pickDropHref: waHref(settings?.quick_buttons?.pick_drop_whatsapp) ?? SITE.whatsappHref,
    },
  };
}

/** API service (GET /services or /services/{slug}) → service shape. */
export function serviceFromApi(item) {
  return {
    slug: item.slug,
    name: item.name,
    icon: item.icon,
    text: item.short_description ?? "",
    duration: item.duration,
    isBookable: item.is_bookable ?? true,
    photo: item.image ? { src: item.image.url, alt: item.image.alt } : null,
    headline: item.headline ?? item.name,
    descriptionHtml: item.description ?? "",
    included: item.included ?? [],
    signs: item.signs ?? [],
    faqs: item.faqs ?? [],
    meta: item.meta ?? { title: item.name, description: item.short_description },
  };
}

/** Built-in services, used when the API can't be reached. */
export const FALLBACK_SERVICES = HOME_SERVICES.map((service) => {
  const detail = SERVICE_DETAILS[service.slug];
  return {
    slug: service.slug,
    name: service.name,
    icon: service.icon,
    text: service.text,
    duration: detail.duration,
    isBookable: true,
    photo: detail.photo,
    headline: detail.headline,
    descriptionHtml: `<p>${detail.intro}</p>`,
    included: detail.included,
    signs: detail.signs,
    faqs: detail.faqs,
    meta: { title: `${service.name} in Dhaka`, description: detail.intro },
  };
});

/**
 * Split page HTML at each <h2> into sections for the legal-page layout
 * (numbered headings + "On this page"): [{ id, title, html }].
 */
export function htmlSections(html) {
  const parts = (html ?? "").split(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const sections = [];
  for (let i = 1; i < parts.length; i += 2) {
    const title = htmlToText(parts[i]);
    const id =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `section-${sections.length + 1}`;
    sections.push({ id, title, html: parts[i + 1].trim() });
  }
  return sections;
}

/** ISO timestamp → "11 November 2026" (Dhaka time). */
export function formatLongDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

/** A plain-text summary of HTML (for meta descriptions and structured data). */
export function htmlToText(html) {
  return (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
