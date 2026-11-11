import Link from "next/link";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";

export const metadata = {
  title: "Forgot password",
};

/** Request a password reset link (Step 3 §4.3). */
export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-ink-900">Forgot your password?</h1>
      <p className="mt-2 text-zinc-600">Enter your email and we&apos;ll send you a link to set a new one.</p>

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>

      <p className="mt-8 text-center text-sm text-zinc-600">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
