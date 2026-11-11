"use client";

import { MailWarning } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api/browser-client";

/**
 * Shown in the account area until the email is verified. Service history stays
 * hidden until then (Step 3 §4.1), so the reason is spelled out.
 */
export function VerifyEmailNotice({ email }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const resend = async () => {
    setSending(true);
    try {
      const { data } = await api.post("/auth/email/verification-notification");
      setSent(true);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-card border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex gap-3">
        <MailWarning className="size-5 shrink-0 text-amber-600" aria-hidden="true" />
        <span>
          <strong>Please verify your email.</strong> We sent a link to <strong>{email}</strong>. Your service history
          appears once it&apos;s verified.
        </span>
      </p>
      <button
        type="button"
        onClick={resend}
        disabled={sending || sent}
        className="shrink-0 self-start rounded-control border border-amber-400 bg-white px-3 py-1.5 font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60 sm:self-auto"
      >
        {sent ? "Link sent" : sending ? "Sending…" : "Resend link"}
      </button>
    </div>
  );
}
