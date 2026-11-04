import Link from "next/link";

export const metadata = {
  title: "Log in",
};

/* Placeholder (F0). The working login form is built in milestone F1. */
export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Log in to your account</h1>
      <p className="mt-2 text-sm text-zinc-600">Customer login is being built in the next milestone (F1).</p>
      <p className="mt-6 text-sm">
        <Link href="/" className="font-medium text-brand-600 hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
