import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";

/**
 * POST /api/revalidate — called by Laravel after admins change public content
 * (Step 6 §3). Body: { "tags": ["services", "service:engine-repair"] }.
 * Only clears cached pages; contains no business logic.
 */
function isAuthorized(request) {
  const expected = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("x-revalidate-secret");
  if (!expected || !given) return false;

  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((tag) => typeof tag === "string" && tag.length > 0 && tag.length <= 256).slice(0, 64)
    : [];

  if (tags.length === 0) {
    return Response.json({ ok: false, message: "No tags given" }, { status: 422 });
  }

  // Stale-while-revalidate: the next visitor triggers a fresh render.
  for (const tag of tags) revalidateTag(tag, "max");

  return Response.json({ ok: true, revalidated: tags });
}
