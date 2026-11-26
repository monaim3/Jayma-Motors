import Link from "next/link";
import { AuthSwitchLink, BookingResumeNotice } from "@/components/features/auth/AuthNextLinks";
import { LoginForm } from "@/components/features/auth/LoginForm";

export const metadata = {
  title: "Log in",
};

/** Customer login (Step 5 §6.10, milestone F1). Staff use /admin/login. */
export default function LoginPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-ink-900">Log in</h1>
      <p className="mt-2 text-zinc-600">See your bookings, vehicles and service history.</p>
      <BookingResumeNotice />

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-8 text-center text-sm text-zinc-600">
        New to Jayma Motors? <AuthSwitchLink href="/register">Create an account</AuthSwitchLink>
      </p>
      <p className="mt-3 text-center text-sm">
        <Link href="/" className="text-zinc-500 hover:text-ink-900">
          ← Back to website
        </Link>
      </p>
    </div>
  );
}
