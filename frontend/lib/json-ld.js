/**
 * JSON-LD for a <script type="application/ld+json"> tag. Escapes "<" so text
 * from the API (service names, FAQ answers, addresses) can never close the
 * script tag and inject its own script.
 */
export function jsonLdHtml(data) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
