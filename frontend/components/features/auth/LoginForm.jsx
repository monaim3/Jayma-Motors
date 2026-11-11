"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
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
import { safeNextPath } from "@/lib/auth";

const schema = z.object({
  login: z.string().trim().min(1, "Enter your phone number or email."),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});

/** Customer login: phone or email + password (Step 3 §4.2). */
export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { login: "", password: "", remember: false } });

  const onSubmit = async (values) => {
    try {
      await ensureCsrfCookie();
      const { data } = await api.post("/auth/login", values);
      toast.success(`Welcome back, ${data.data.name.split(" ")[0]}!`);
      router.replace(safeNextPath());
      router.refresh();
    } catch (error) {
      if (applyFieldErrors(error, setError)) return;
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField id="login" label="Phone or email" required error={errors.login?.message}>
        <Input
          className="h-10"
          type="text"
          autoComplete="username"
          placeholder="01XXXXXXXXX or you@example.com"
          autoFocus
          {...register("login")}
        />
      </FormField>

      <div className="space-y-1.5">
        <FormField id="password" label="Password" required error={errors.password?.message}>
          <PasswordInput autoComplete="current-password" {...register("password")} />
        </FormField>
        <div className="flex items-center justify-between pt-1 text-sm">
          <label className="flex items-center gap-2 text-zinc-600">
            <input type="checkbox" className="size-4 accent-brand-600" {...register("remember")} />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-medium text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        {!isSubmitting && <LogIn aria-hidden="true" />}
        Log in
      </Button>
    </form>
  );
}
