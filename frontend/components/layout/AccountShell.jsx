"use client";

import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { ACCOUNT_NAV, BOOKING_HREF } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { NAV_ICONS } from "./nav-icons";

/** Bottom navigation on mobile shows these five (Step 5 §4.3). */
const MOBILE_NAV = [
  "/account",
  "/account/vehicles",
  "/account/appointments",
  "/account/service-history",
  "/account/profile",
];
const MOBILE_LABELS = {
  "/account": "Home",
  "/account/appointments": "Bookings",
  "/account/service-history": "History",
};

function isActive(pathname, href) {
  return href === "/account" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Customer portal frame: sidebar (desktop), top bar, bottom nav (mobile). */
export function AccountShell({ userSlot, children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-zinc-200 px-6">
          <Logo className="h-9" />
        </div>
        <nav aria-label="Account" className="flex-1 space-y-1 p-3">
          {ACCOUNT_NAV.map((item) => {
            const Icon = NAV_ICONS[item.icon];
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium",
                  active ? "bg-brand-50 text-brand-700" : "text-zinc-700 hover:bg-zinc-100",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 sm:px-6">
          <Logo className="h-8 lg:hidden" />
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <div className="text-sm text-zinc-600">{userSlot}</div>
            <Button href={BOOKING_HREF} size="sm">
              <CalendarCheck aria-hidden="true" />
              <span className="hidden sm:inline">Book Appointment</span>
              <span className="sm:hidden">Book</span>
            </Button>
          </div>
        </header>

        <main id="main" className="px-4 py-6 pb-24 sm:px-6 lg:pb-8">
          {children}
        </main>
      </div>

      <nav
        aria-label="Account (mobile)"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-zinc-200 bg-white lg:hidden"
      >
        {ACCOUNT_NAV.filter((item) => MOBILE_NAV.includes(item.href)).map((item) => {
          const Icon = NAV_ICONS[item.icon];
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                active ? "text-brand-600" : "text-zinc-500",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {MOBILE_LABELS[item.href] ?? item.label.replace("My ", "")}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
