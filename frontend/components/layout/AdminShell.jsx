"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { ADMIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { NAV_ICONS } from "./nav-icons";

function isActive(pathname, href) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Admin frame: dark sidebar grouped Operations / Website / System (Step 5 §4.4).
 * `permissions` hides items the signed-in role cannot use; null shows everything
 * (used until authentication arrives in F1).
 */
export function AdminShell({ permissions = null, userSlot, children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const allowed = (item) => permissions === null || permissions.includes(item.permission);

  const sidebar = (
    <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {ADMIN_NAV.map((group) => {
        const items = group.items.filter(allowed);
        if (items.length === 0) return null;
        return (
          <div key={group.label}>
            <p className="px-3 pb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">{group.label}</p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const Icon = NAV_ICONS[item.icon];
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium",
                        active ? "bg-brand-600 text-white" : "text-zinc-300 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-ink-950 lg:flex">
        <div className="flex h-16 items-center px-6">
          <Logo variant="white" href="/admin" className="h-9" />
        </div>
        {sidebar}
      </aside>

      {/* Mobile / tablet drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "visible" : "invisible")} aria-hidden={!open}>
        <div
          className={cn("absolute inset-0 bg-ink-950/60 transition-opacity", open ? "opacity-100" : "opacity-0")}
          onClick={() => setOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Admin menu"
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 flex-col bg-ink-950 transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <Logo variant="white" href="/admin" className="h-8" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="rounded-control p-2 text-zinc-300 hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
          </div>
          {sidebar}
        </aside>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-6!" />
          </Button>
          <div className="ml-auto text-sm text-zinc-600">{userSlot}</div>
        </header>
        <main id="main" className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
