import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} collects, uses and protects your personal information.`,
  alternates: { canonical: "/privacy" },
};

/**
 * DRAFT privacy policy (based on what the system actually collects — Step 2
 * forms, accounts, service records, cookies). Owner to have it reviewed before
 * launch (Step 10 checklist). Later editable via the pages API (F2).
 */
const SECTIONS = [
  {
    id: "who",
    title: "Who we are",
    body: (
      <>
        <p>
          {SITE.name} is a car service and repair workshop at {SITE.address}. This policy explains what personal
          information we collect through our website and workshop, and how we use it.
        </p>
      </>
    ),
  },
  {
    id: "collect",
    title: "Information we collect",
    body: (
      <>
        <p>We only collect what we need to serve you:</p>
        <ul>
          <li>
            <strong>Contact details</strong> — name, phone number and (optional) email, when you book, send an
            enquiry, contact us or create an account.
          </li>
          <li>
            <strong>Vehicle details</strong> — brand, model, year and registration number.
          </li>
          <li>
            <strong>Service records</strong> — the work done on your vehicle, parts used and invoices.
          </li>
          <li>
            <strong>Messages and reviews</strong> — what you write to us, and reviews you choose to publish.
          </li>
          <li>
            <strong>Technical data</strong> — basic information your browser sends (such as device type and pages
            visited), used to keep the site working and secure.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <ul>
        <li>To confirm and manage your bookings, and call or message you about your vehicle.</li>
        <li>To answer your enquiries and messages.</li>
        <li>To keep your service history, so we can advise you better next time.</li>
        <li>To send service reminders, only if you have an account or have agreed to them.</li>
        <li>To protect the website from spam and misuse.</li>
      </ul>
    ),
  },
  {
    id: "share",
    title: "Sharing your information",
    body: (
      <>
        <p>
          <strong>We do not sell your information.</strong> We share it only when needed:
        </p>
        <ul>
          <li>With service providers that run our website, email and hosting, under confidentiality.</li>
          <li>With your insurer, only if you ask us to help with a claim.</li>
          <li>When the law requires it.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <>
        <p>
          We use only essential cookies — for example to keep you logged in to your account and to protect forms. We
          do not use advertising cookies. The map on our site is provided by third parties (Esri, MapTiler and
          OpenStreetMap), which may receive your IP address when it loads.
        </p>
      </>
    ),
  },
  {
    id: "keep",
    title: "How long we keep it",
    body: (
      <>
        <p>
          Service records are kept for as long as you are our customer, so your vehicle&apos;s history is available.
          Enquiries and messages are kept as long as needed to answer them and for our records. You can ask us to
          delete your information at any time, unless we must keep it by law (for example, invoices).
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Keeping it safe",
    body: (
      <>
        <p>
          Our website uses secure (HTTPS) connections, passwords are stored encrypted, and only authorized staff can
          see customer records.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your choices",
    body: (
      <>
        <p>
          You can ask to see, correct or delete your information, or stop service reminders, by calling{" "}
          <a href={SITE.phoneHref}>{SITE.phone}</a> or emailing <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          If you have an account, you can update your profile yourself.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <>
        <p>
          We may update this policy from time to time; the date at the top shows the latest version. See also our{" "}
          <Link href="/terms">Terms & Conditions</Link>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="What information we collect, why we need it, and how we keep it safe."
      updated="9 November 2026"
      crumb="Privacy Policy"
      sections={SECTIONS}
    />
  );
}
