"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api/browser-client";
import { applyFieldErrors } from "@/lib/api/errors";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Same rule as the backend PhoneNumber helper: 01XXXXXXXXX, 8801… or +8801…
const BD_MOBILE = /^(?:\+?88)?01[3-9]\d{8}$/;

export const CONTACT_SUBJECTS = ["General question", "Price / quote", "Feedback", "Complaint", "Other"];

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  phone: z
    .string()
    .trim()
    .refine((value) => BD_MOBILE.test(value.replace(/[\s\-().]/g, "")), "Enter a valid mobile number (01XXXXXXXXX)."),
  email: z.union([z.literal(""), z.email("Enter a valid email address.")]),
  subject: z.string().min(1, "Choose a subject."),
  message: z.string().trim().min(10, "Please write at least a few words.").max(2000, "Keep it under 2000 characters."),
  website: z.string().max(0).optional(), // honeypot
});

const EMPTY = { name: "", phone: "", email: "", subject: "", message: "", website: "" };

const inputClass =
  "w-full rounded-control border bg-white/[0.03] px-4 py-3 text-base text-white transition-colors placeholder:text-zinc-500 focus:border-brand-500 focus:bg-white/[0.06] focus:outline-none [color-scheme:dark]";

function Field({ id, label, required, error, className, children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-zinc-200">
        {label}
        {required ? (
          <span className="ml-1 text-brand-500" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 font-normal text-zinc-500">(optional)</span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Contact page message form (owner request 2026-11-09; replaces decision U6).
 * Posts to POST /api/v1/contact-messages (backend milestone B6, with enquiries).
 */
export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const onSubmit = async (values) => {
    try {
      await api.post("/contact-messages", values);
      reset(EMPTY);
      toast.success("Message sent", { description: "Thanks! We'll get back to you soon." });
    } catch (error) {
      if (applyFieldErrors(error, setError)) return;
      toast.error("Couldn't send your message", {
        description: `Please try again, or call us on ${SITE.phone}.`,
      });
    }
  };

  const fieldProps = (name) => ({
    id: `contact-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
    className: cn(inputClass, errors[name] ? "border-danger-600" : "border-white/15 hover:border-white/30"),
    ...register(name),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field id="contact-name" label="Your name" required error={errors.name?.message}>
        <input type="text" autoComplete="name" {...fieldProps("name")} />
      </Field>
      <Field id="contact-phone" label="Phone" required error={errors.phone?.message}>
        <input type="tel" inputMode="tel" autoComplete="tel" {...fieldProps("phone")} />
      </Field>
      <Field id="contact-email" label="Email" error={errors.email?.message}>
        <input type="email" autoComplete="email" {...fieldProps("email")} />
      </Field>
      <Field id="contact-subject" label="Subject" required error={errors.subject?.message}>
        <select {...fieldProps("subject")}>
          <option value="" disabled className="bg-ink-900">
            Choose a subject
          </option>
          {CONTACT_SUBJECTS.map((subject) => (
            <option key={subject} value={subject} className="bg-ink-900">
              {subject}
            </option>
          ))}
        </select>
      </Field>
      <Field id="contact-message" label="Message" required error={errors.message?.message} className="sm:col-span-2">
        <textarea rows={5} {...fieldProps("message")} className={cn(fieldProps("message").className, "resize-y")} />
      </Field>

      {/* Honeypot: hidden from people, bots fill it in. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        {...register("website")}
      />

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">We usually reply within a few hours, during opening hours.</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-control bg-brand-600 px-8 font-semibold whitespace-nowrap text-white shadow-lg shadow-brand-900/50 transition-colors hover:bg-brand-700 disabled:opacity-70"
        >
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
