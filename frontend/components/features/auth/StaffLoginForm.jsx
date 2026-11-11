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
  email: z.email("Enter your work email."),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});

/** Staff login (POST /auth/staff/login): email + password, then into the admin panel. */
export function StaffLoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", remember: false } });

  const onSubmit = async (values) => {
    try {
      await ensureCsrfCookie();
      const { data } = await api.post("/auth/staff/login", values);
      toast.success(`Welcome back, ${data.data.name.split(" ")[0]}!`);
      const next = safeNextPath("/admin");
      router.replace(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (error) {
      if (applyFieldErrors(error, setError)) return;
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField id="email" label="Email" required error={errors.email?.message}>
        <Input
          className="h-10"
          type="email"
          autoComplete="username"
          placeholder="you@jaymamotors.com"
          autoFocus
          {...register("email")}
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
