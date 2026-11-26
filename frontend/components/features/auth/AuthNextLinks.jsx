"use client";

import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { safeNextPath } from "@/lib/auth";

const subscribe = () => () => {};
const getNext = () => safeNextPath("");
const getServerNext = () => "";

/** The ?next= return path (empty when the page was opened directly). */
function useNext() {
  return useSyncExternalStore(subscribe, getNext, getServerNext);
}

/** Login ⇄ sign-up link that keeps the visitor's return path (e.g. back to their booking). */
export function AuthSwitchLink({ href, children }) {
  const next = useNext();
  return (
    <Link
      href={next ? `${href}?next=${encodeURIComponent(next)}` : href}
      className="font-semibold text-brand-600 hover:underline"
    >
      {children}
    </Link>
  );
}

/** Shown when a guest was sent here from the booking form. */
export function BookingResumeNotice() {
  const next = useNext();
  if (!next.includes("booking=resume")) return null;

  return (
    <p className="mt-5 flex items-start gap-3 rounded-card border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
      <CalendarCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        <strong>Your booking is waiting.</strong> Log in or create an account and we&apos;ll take you straight back to
        it, with your details already filled in.
      </span>
    </p>
  );
}
