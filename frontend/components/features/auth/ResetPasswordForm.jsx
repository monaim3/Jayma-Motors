"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PasswordInput } from "@/components/features/auth/PasswordInput";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { api, ensureCsrfCookie } from "@/lib/api/browser-client";
import { applyFieldErrors } from "@/lib/api/errors";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/\d/, "Include at least one number."),
    password_confirmation: z.string(),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords don't match.",
  });

const subscribeNoop = () => () => {};
const readLink = () => window.location.search;

/**
 * Set a new password from the emailed link (?token=&email=). New staff will use
 * the same link to set their first password (staff login comes with the admin login page).
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const search = useSyncExternalStore(subscribeNoop, readLink, () => "");
  const params = new URLSearchParams(search);
  const token = params.get("token");
  const email = params.get("email");
  const [linkError, setLinkError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { password: "", password_confirmation: "" } });

  const onSubmit = async (values) => {
    try {
      await ensureCsrfCookie();
      await api.post("/auth/reset-password", { ...values, token, email });
      toast.success("Password changed", { description: "You can now log in with your new password." });
      router.replace("/login");
    } catch (error) {
      if (error.fieldErrors?.email || error.fieldErrors?.token) {
        setLinkError(error.fieldErrors.email ?? error.fieldErrors.token);
        return;
      }
      if (applyFieldErrors(error, setError)) return;
      toast.error(error.message);
    }
  };

  if (linkError || (search && (!token || !email))) {
    return (
      <div role="alert" className="rounded-card border border-danger-600/30 bg-red-50 p-5 text-sm text-red-900">
        <p className="font-semibold">This link can&apos;t be used</p>
        <p className="mt-1">
          {linkError ?? "This reset link is incomplete. Please open the link from your email again."}
        </p>
        <Link href="/forgot-password" className="mt-3 inline-block font-semibold text-brand-600 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {email && (
        <p className="rounded-control bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
          Resetting the password for <strong className="text-ink-900">{email}</strong>
        </p>
      )}
      <FormField
        id="password"
        label="New password"
        required
        hint="At least 8 characters, with a letter and a number."
        error={errors.password?.message}
      >
        <PasswordInput autoComplete="new-password" autoFocus {...register("password")} />
      </FormField>
      <FormField
        id="password_confirmation"
        label="Confirm new password"
        required
        error={errors.password_confirmation?.message}
      >
        <PasswordInput autoComplete="new-password" {...register("password_confirmation")} />
      </FormField>
      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        {!isSubmitting && <KeyRound aria-hidden="true" />}
        Set new password
      </Button>
    </form>
  );
}
