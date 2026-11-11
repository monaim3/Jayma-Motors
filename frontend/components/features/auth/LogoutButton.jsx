"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api/browser-client";
import { cn } from "@/lib/utils";

/** Ends the Laravel session, then returns to the given login page. */
export function LogoutButton({ redirectTo = "/login", className }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Already signed out (401) is fine; anything else is worth telling.
      if (error.status !== 401) {
        toast.error(error.message);
        setBusy(false);
        return;
      }
    }
    toast.success("You're logged out.");
    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-ink-900 disabled:opacity-60",
        className,
      )}
    >
      <LogOut className="size-4" aria-hidden="true" />
      Log out
    </button>
  );
}
