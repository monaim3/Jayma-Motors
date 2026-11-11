import { VerifyEmail } from "@/components/features/auth/VerifyEmail";

export const metadata = {
  title: "Verify your email",
};

/** Opened from the verification email (?id=&hash=&expires=&signature=). */
export default function VerifyEmailPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-ink-900">Verify your email</h1>
      <div className="mt-8">
        <VerifyEmail />
      </div>
    </div>
  );
}
