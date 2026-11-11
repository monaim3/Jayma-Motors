import { LoaderCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LogoutButton } from "@/components/features/auth/LogoutButton";
import { AdminShell } from "@/components/layout/AdminShell";
import { getCurrentUser } from "@/lib/api/session";

export const metadata = {
  title: { default: "Admin", template: "%s | Jayma Motors Admin" },
  robots: { index: false },
};

const ROLE_LABELS = { "super-admin": "Super Admin", manager: "Manager", "service-advisor": "Service Advisor" };

/**
 * Loads the signed-in staff member (GET /auth/me). Logged-out visitors go to
 * /admin/login, customers to their own account. The menu shows only what the
 * role's permissions allow; Laravel still checks every request.
 */
async function AdminFrame({ children }) {
  const user = await getCurrentUser("/admin/login");
  if (user.type !== "staff") redirect("/account");

  return (
    <AdminShell
      permissions={user.permissions}
      userSlot={
        <span className="flex items-center gap-3">
          <span className="hidden text-right leading-tight sm:block">
            <span className="block font-semibold text-ink-900">{user.name}</span>
            <span className="block text-xs text-zinc-500">{ROLE_LABELS[user.roles[0]] ?? user.roles[0]}</span>
          </span>
          <LogoutButton redirectTo="/admin/login" />
        </span>
      }
    >
      {children}
    </AdminShell>
  );
}

function AdminLoading() {
  return (
    <div role="status" className="flex min-h-dvh items-center justify-center gap-3 bg-zinc-100 text-zinc-600">
      <LoaderCircle className="size-5 animate-spin text-brand-600" aria-hidden="true" />
      Loading the admin panel…
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminFrame>{children}</AdminFrame>
    </Suspense>
  );
}
