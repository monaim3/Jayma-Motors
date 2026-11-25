"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/features/auth/PasswordInput";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { api, ensureCsrfCookie } from "@/lib/api/browser-client";

function useSubmit(send, success) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const onSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setErrors({});
    try {
      await ensureCsrfCookie();
      await send(Object.fromEntries(new FormData(formElement)), formElement);
      if (success) toast.success(success);
    } catch (error) {
      if (error.isValidation) setErrors(error.fieldErrors);
      else toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return { busy, errors, onSubmit };
}

/** PATCH /me/profile — name and email (a new email must be verified again). */
export function ProfileForm({ profile }) {
  const router = useRouter();
  const { busy, errors, onSubmit } = useSubmit(async (values) => {
    const { data } = await api.patch("/me/profile", values);
    if (data.data.email !== profile.email) {
      toast.success("Profile saved", { description: `We sent a verification link to ${data.data.email}.` });
    } else {
      toast.success("Profile saved");
    }
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField id="p-name" label="Name" required error={errors.name}>
        <Input name="name" defaultValue={profile.name} maxLength={100} autoComplete="name" />
      </FormField>
      <FormField
        id="p-email"
        label="Email"
        required
        hint="If you change it, we'll ask you to verify the new address."
        error={errors.email}
      >
        <Input name="email" type="email" defaultValue={profile.email} autoComplete="email" />
      </FormField>
      <FormField id="p-phone" label="Phone" hint="To change your phone number, please call us.">
        <Input value={profile.phone_display ?? ""} disabled readOnly />
      </FormField>
      <Button type="submit" size="sm" loading={busy}>
        Save profile
      </Button>
    </form>
  );
}

/** PUT /me/password — needs the current password. */
export function PasswordForm() {
  const { busy, errors, onSubmit } = useSubmit(async (values, form) => {
    await api.put("/me/password", values);
    form.reset();
  }, "Password changed");

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField id="pw-current" label="Current password" required error={errors.current_password}>
        <PasswordInput name="current_password" autoComplete="current-password" />
      </FormField>
      <FormField id="pw-new" label="New password" required hint="At least 8 characters." error={errors.password}>
        <PasswordInput name="password" autoComplete="new-password" />
      </FormField>
      <FormField id="pw-confirm" label="Confirm new password" required error={errors.password_confirmation}>
        <PasswordInput name="password_confirmation" autoComplete="new-password" />
      </FormField>
      <Button type="submit" size="sm" variant="secondary" loading={busy}>
        Change password
      </Button>
    </form>
  );
}
