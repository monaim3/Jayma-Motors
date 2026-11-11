import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LogoutButton } from "@/components/features/auth/LogoutButton";
import { VerifyEmailNotice } from "@/components/features/auth/VerifyEmailNotice";
import { AccountShell } from "@/components/layout/AccountShell";
import { getCurrentUser } from "@/lib/api/session";

export const metadata = {
  title: "My Account",
  robots: { index: false },
};

/** Greeting + logout in the top bar. Reads the session, so it renders inside <Suspense>. */
async function AccountUser() {
  const user = await getCurrentUser();
  // Staff have no customer account; their home is the admin panel.
  if (user.type === "staff") redirect("/admin");
  return (
    <span className="flex items-center gap-3">
      <span className="hidden sm:inline">
        Hi, <strong className="text-ink-900">{user.name.split(" ")[0]}</strong>
      </span>
      <LogoutButton />
    </span>
  );
}

async function AccountNotices() {
  const user = await getCurrentUser();
  return user.email_verified ? null : <VerifyEmailNotice email={user.email} />;
}

/** Customer portal (Step 5 §4.3). The session is checked by Laravel on every request. */
export default function AccountLayout({ children }) {
  return (
    <AccountShell
      userSlot={
        <Suspense fallback={<span className="text-zinc-400">Loading…</span>}>
          <AccountUser />
        </Suspense>
      }
    >
      <Suspense fallback={null}>
        <AccountNotices />
      </Suspense>
      {children}
    </AccountShell>
  );
}
