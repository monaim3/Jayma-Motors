import { ResetPasswordForm } from "@/components/features/auth/ResetPasswordForm";

export const metadata = {
  title: "Set a new password",
};

/** Opened from the reset email (?token=&email=). */
export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-ink-900">Set a new password</h1>
      <p className="mt-2 text-zinc-600">Choose a password you don&apos;t use anywhere else.</p>

      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
