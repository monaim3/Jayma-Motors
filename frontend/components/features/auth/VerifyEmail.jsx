"use client";

import { CircleCheck, CircleX, LoaderCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api/browser-client";

const subscribeNoop = () => () => {};
const readSearch = () => window.location.search;

/**
 * Landing page for the emailed verification link (?id=&hash=&expires=&signature=).
 * Forwards the signed parameters to the API. The customer must be logged in to
 * the same account (Step 7 §8).
 */
export function VerifyEmail() {
  // null during the server render; the link's query string in the browser.
  const search = useSyncExternalStore(subscribeNoop, readSearch, () => null);
  const params = new URLSearchParams(search ?? "");
  const id = params.get("id");
  const hash = params.get("hash");
  const signature = params.get("signature");
  const expires = params.get("expires") ?? "";
  const incomplete = search !== null && (!id || !hash || !signature);

  const [state, setState] = useState({ status: "verifying" });

  useEffect(() => {
    if (!id || !hash || !signature) return;

    const query = new URLSearchParams({ expires, signature });
    api
      .get(`/auth/email/verify/${encodeURIComponent(id)}/${encodeURIComponent(hash)}?${query}`)
      .then(() => setState({ status: "verified" }))
      .catch((error) => {
        if (error.status === 401) setState({ status: "login" });
        else if (error.status === 403)
          setState({ status: "invalid", message: "This link has expired or is for a different account." });
        else setState({ status: "invalid", message: error.message });
      });
  }, [id, hash, signature, expires]);

  if (incomplete) {
    return <Failure message="This verification link is incomplete. Please open it from your email again." />;
  }

  if (state.status === "verifying") {
    return (
      <p role="status" className="flex items-center gap-3 text-zinc-600">
        <LoaderCircle className="size-5 animate-spin text-brand-600" aria-hidden="true" />
        Verifying your email…
      </p>
    );
  }

  if (state.status === "verified") {
    return (
      <div role="status">
        <CircleCheck className="size-10 text-emerald-600" aria-hidden="true" />
        <h2 className="mt-3 text-xl font-bold text-ink-900">Email verified</h2>
        <p className="mt-1 text-zinc-600">Thank you! Your service history is now available in your account.</p>
        <Button href="/account" className="mt-6">
          Go to my account
        </Button>
      </div>
    );
  }

  if (state.status === "login") {
    const next = `/verify-email${search ?? ""}`;
    return (
      <div role="status">
        <p className="text-zinc-600">Please log in to the account you registered, then we&apos;ll verify your email.</p>
        <Button href={`/login?next=${encodeURIComponent(next)}`} className="mt-6">
          <LogIn aria-hidden="true" />
          Log in to verify
        </Button>
      </div>
    );
  }

  return <Failure message={state.message} />;
}

function Failure({ message }) {
  return (
    <div role="alert">
      <CircleX className="size-10 text-danger-600" aria-hidden="true" />
      <h2 className="mt-3 text-xl font-bold text-ink-900">We couldn&apos;t verify your email</h2>
      <p className="mt-1 text-zinc-600">{message}</p>
      <p className="mt-1 text-zinc-600">
        You can request a new link from{" "}
        <Link href="/account" className="font-semibold text-brand-600 hover:underline">
          your account
        </Link>
        .
      </p>
    </div>
  );
}
