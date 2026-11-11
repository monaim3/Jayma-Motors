"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { api, ensureCsrfCookie } from "@/lib/api/browser-client";
import { applyFieldErrors } from "@/lib/api/errors";

const schema = z.object({ email: z.email("Enter the email you registered with.") });

/** Request a reset link (Step 3 §4.3). The reply is the same whether or not the email exists. */
export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async (values) => {
    try {
      await ensureCsrfCookie();
      await api.post("/auth/forgot-password", values);
      setSentTo(values.email);
    } catch (error) {
      if (applyFieldErrors(error, setError)) return;
      toast.error(error.message);
    }
  };

  if (sentTo) {
    return (
      <div role="status" className="rounded-card border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
        <MailCheck className="mb-2 size-6 text-emerald-600" aria-hidden="true" />
        <p className="font-semibold">Check your inbox</p>
        <p className="mt-1">
          If an account exists for <strong>{sentTo}</strong>, we&apos;ve sent a link to reset your password. It works
          for 60 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField id="email" label="Email" required error={errors.email?.message}>
        <Input
          className="h-10"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          {...register("email")}
        />
      </FormField>
      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        {!isSubmitting && <Send aria-hidden="true" />}
        Send reset link
      </Button>
    </form>
  );
}
