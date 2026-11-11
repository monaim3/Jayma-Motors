import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { FALLBACK_SERVICES, FALLBACK_SITE, serviceFromApi, siteFromSettings } from "@/lib/site";
import { publicFetch } from "./public-fetch";

/**
 * Public content from Laravel (Step 6 §3), cached for 10 minutes ("content")
 * and refreshed sooner when Laravel calls POST /api/revalidate with the tag.
 *
 * If the API can't be reached, the built-in copy is returned instead, so the
 * website never breaks. (That result is cached too and retried after 10 minutes.)
 */

const unreachable = (error) => !error?.status || error.status >= 500;

/** Business details for the whole site (tag: settings). */
export async function getSite() {
  "use cache";
  cacheLife("content");
  cacheTag("settings");

  try {
    const { data } = await publicFetch("/settings/public");
    return siteFromSettings(data);
  } catch {
    return FALLBACK_SITE;
  }
}

/** Published services in display order (tag: services). */
export async function getServices() {
  "use cache";
  cacheLife("content");
  cacheTag("services");

  try {
    const { data } = await publicFetch("/services");
    return data.map(serviceFromApi);
  } catch {
    return FALLBACK_SERVICES;
  }
}

/** One published service with 3 related ones, or null when it doesn't exist (tags: services, service:slug). */
export async function getService(slug) {
  "use cache";
  cacheLife("content");
  cacheTag("services", `service:${slug}`);

  try {
    const { data } = await publicFetch(`/services/${encodeURIComponent(slug)}`);
    return { ...serviceFromApi(data), related: (data.related ?? []).map(serviceFromApi) };
  } catch (error) {
    if (!unreachable(error)) return null;
    const service = FALLBACK_SERVICES.find((item) => item.slug === slug);
    return service ? { ...service, related: FALLBACK_SERVICES.filter((item) => item.slug !== slug).slice(0, 3) } : null;
  }
}

/**
 * An editable page (about, terms, privacy): { title, bodyHtml, updatedAt, meta, heroImage }.
 * null when the API is unreachable — the page then shows its built-in text.
 */
export async function getPage(key) {
  "use cache";
  cacheLife("content");
  cacheTag("pages", `page:${key}`);

  try {
    const { data } = await publicFetch(`/pages/${encodeURIComponent(key)}`);
    return {
      title: data.title,
      bodyHtml: data.body ?? "",
      updatedAt: data.updated_at,
      meta: data.meta,
      heroImage: data.hero_image,
    };
  } catch {
    return null;
  }
}
