import { AuthSwitchLink, BookingResumeNotice } from "@/components/features/auth/AuthNextLinks";
import { RegisterForm } from "@/components/features/auth/RegisterForm";

export const metadata = {
  title: "Create an account",
};

/** Customer sign-up (Step 5 §6.10, milestone F1). */
export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-ink-900">Create your account</h1>
      <p className="mt-2 text-zinc-600">
        Book faster, track your car&apos;s service and keep its history in one place.
      </p>
      <BookingResumeNotice />

      <div className="mt-8">
        <RegisterForm />
      </div>

      <p className="mt-8 text-center text-sm text-zinc-600">
        Already have an account? <AuthSwitchLink href="/login">Log in</AuthSwitchLink>
      </p>
    </div>
  );
}
