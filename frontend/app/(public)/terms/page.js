import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Terms & Conditions",
  description: `The terms for booking and using ${SITE.name}'s car service and repair workshop in Vatara, Dhaka.`,
  alternates: { canonical: "/terms" },
};

/**
 * DRAFT terms for a Bangladeshi car workshop — the owner should have them
 * reviewed by a lawyer before launch (Step 10 checklist). Later editable via
 * the pages API (F2).
 */
const SECTIONS = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <>
        <p>
          These terms apply when you use the {SITE.name} website or bring your vehicle to our workshop at{" "}
          {SITE.address}. By booking a service or leaving your vehicle with us, you agree to them.
        </p>
        <p>If anything here is unclear, please ask us before work begins.</p>
      </>
    ),
  },
  {
    id: "bookings",
    title: "Bookings and appointments",
    body: (
      <>
        <p>
          A booking made on this website, by phone or on WhatsApp is a <strong>request</strong>. It is confirmed when
          our team contacts you. The time is an estimate; busy days or urgent jobs can change it.
        </p>
        <p>
          Please tell us as early as you can if you need to cancel or change your appointment. Walk-ins are welcome
          and are served as soon as a bay is free.
        </p>
      </>
    ),
  },
  {
    id: "quotes",
    title: "Diagnosis, quotes and approval",
    body: (
      <>
        <p>
          We inspect or diagnose your vehicle first and explain what we find. Before any repair we give you a quote,
          and we <strong>start work only after you approve it</strong>.
        </p>
        <ul>
          <li>Diagnosis or inspection may be charged even if you decide not to go ahead with the repair.</li>
          <li>Quotes are based on what we can see; hidden faults found during work may change the price.</li>
          <li>If extra work is needed, we contact you and wait for your approval before doing it.</li>
        </ul>
      </>
    ),
  },
  {
    id: "parts",
    title: "Parts and materials",
    body: (
      <>
        <p>
          We use genuine or good-quality parts, and genuine Shell Helix oils as an authorized dealer. If you ask for
          reconditioned or customer-supplied parts, we will fit them, but we cannot guarantee parts we did not supply.
        </p>
        <p>Replaced parts can be returned to you on request when the job is finished.</p>
      </>
    ),
  },
  {
    id: "payment",
    title: "Prices and payment",
    body: (
      <>
        <p>
          Prices are in Bangladeshi Taka (BDT). Payment is due when you collect your vehicle, unless we have agreed
          otherwise in writing. We may keep the vehicle until the agreed amount is paid.
        </p>
      </>
    ),
  },
  {
    id: "collection",
    title: "Collecting your vehicle",
    body: (
      <>
        <p>
          We will let you know when your vehicle is ready. Please collect it within <strong>3 days</strong> of that
          notice. After that, a reasonable daily storage charge may apply.
        </p>
      </>
    ),
  },
  {
    id: "belongings",
    title: "Personal belongings",
    body: (
      <>
        <p>
          Please remove valuables, cash and documents you do not need us to have before handing over your vehicle. We
          are not responsible for items left inside.
        </p>
      </>
    ),
  },
  {
    id: "warranty",
    title: "Workmanship warranty",
    body: (
      <>
        <p>
          If a problem comes back because of our workmanship, bring the vehicle back and we will inspect and correct
          it. The warranty period depends on the job and is stated on your invoice.
        </p>
        <p>
          The warranty does not cover normal wear, accident damage, misuse, or repairs done elsewhere after our work.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Our responsibility",
    body: (
      <>
        <p>
          We take good care of every vehicle in our workshop. Where loss or damage is caused by our negligence, we will
          put it right. We are not responsible for existing faults, wear and tear, or problems that were not part of
          the work you asked us to do.
        </p>
      </>
    ),
  },
  {
    id: "pickup",
    title: "Pick & drop and emergency help",
    body: (
      <>
        <p>
          Pick & drop and emergency help are arranged case by case by phone or WhatsApp. Charges, timings and
          availability are confirmed when you arrange them.
        </p>
      </>
    ),
  },
  {
    id: "website",
    title: "Using this website",
    body: (
      <>
        <p>
          Content on this site (text, photos, videos and the logo) belongs to {SITE.name} or is used with permission.
          Car brand names and logos belong to their owners and are shown only to say which makes we service; we are
          an independent workshop, not an official dealer of any manufacturer.
        </p>
        <p>
          How we handle your information is explained in our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes and governing law",
    body: (
      <>
        <p>
          We may update these terms from time to time; the date at the top shows the latest version. These terms are
          governed by the laws of Bangladesh, and the courts of Dhaka have jurisdiction.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="The simple rules for booking, repairs and using our website — so we both know what to expect."
      updated="9 November 2026"
      crumb="Terms & Conditions"
      sections={SECTIONS}
    />
  );
}
