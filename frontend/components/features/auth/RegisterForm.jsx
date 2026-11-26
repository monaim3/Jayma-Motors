"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PasswordInput } from "@/components/features/auth/PasswordInput";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { api, ensureCsrfCookie } from "@/lib/api/browser-client";
import { applyFieldErrors } from "@/lib/api/errors";
import { isBdMobile, safeNextPath } from "@/lib/auth";

// Mirrors the backend rules (Step 3 §4.1); the server has the final say (duplicates etc.).
const schema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name.").max(100),
    phone: z.string().trim().refine(isBdMobile, "Enter a valid mobile number (01XXXXXXXXX)."),
    email: z.email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/\d/, "Include at least one number."),
    password_confirmation: z.string(),
    accept_terms: z.literal(true, { error: "Please accept the terms and privacy policy." }),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords don't match.",
  });

/** Customer sign-up (Step 3 §4.1): logs in straight away; a verification email follows. */
export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "", password: "", password_confirmation: "", accept_terms: false },
  });

  const onSubmit = async (values) => {
    try {
      await ensureCsrfCookie();
      const { data } = await api.post("/auth/register", values);
      toast.success(`Welcome, ${data.data.name.split(" ")[0]}!`, {
        description: `We've sent a verification link to ${data.data.email}.`,
      });
      // Back to where they came from (e.g. their unfinished booking), else the dashboard.
      router.replace(safeNextPath());
      router.refresh();
    } catch (error) {
      if (applyFieldErrors(error, setError)) return;
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField id="name" label="Full name" required error={errors.name?.message}>
        <Input className="h-10" type="text" autoComplete="name" autoFocus {...register("name")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="phone" label="Mobile number" required error={errors.phone?.message}>
          <Input
            className="h-10"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            {...register("phone")}
          />
        </FormField>
        <FormField id="email" label="Email" required error={errors.email?.message}>
          <Input
            className="h-10"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
          />
        </FormField>
      </div>

      <FormField
        id="password"
        label="Password"
        required
        hint="At least 8 characters, with a letter and a number."
        error={errors.password?.message}
      >
        <PasswordInput autoComplete="new-password" {...register("password")} />
      </FormField>
      <FormField
        id="password_confirmation"
        label="Confirm password"
        required
        error={errors.password_confirmation?.message}
      >
        <PasswordInput autoComplete="new-password" {...register("password_confirmation")} />
      </FormField>

      <div>
        <label className="flex items-start gap-2.5 text-sm text-zinc-600">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-brand-600"
            aria-invalid={errors.accept_terms ? true : undefined}
            aria-describedby={errors.accept_terms ? "accept_terms-error" : undefined}
            {...register("accept_terms")}
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="font-medium text-brand-600 hover:underline">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="font-medium text-brand-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.accept_terms && (
          <p id="accept_terms-error" className="mt-1.5 text-sm text-danger-600">
            {errors.accept_terms.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        {!isSubmitting && <UserPlus aria-hidden="true" />}
        Create account
      </Button>
    </form>
  );
}
