import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export const metadata = {
  title: "Management Login",
  robots: { index: false },
};

/* Placeholder (F0). The management login form is built in milestone F1. */
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ink-950 px-4 py-12">
      <Logo variant="white" preload className="h-16" />
      <div className="mt-10 w-full max-w-sm rounded-card border border-white/10 bg-logo-black p-8 text-center">
        <h1 className="text-xl font-bold text-white">Management Login</h1>
        <p className="mt-2 text-sm text-zinc-400">Staff login is being built in the next milestone (F1).</p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-brand-500 hover:underline">
          ← Back to website
        </Link>
      </div>
    </main>
  );
}
