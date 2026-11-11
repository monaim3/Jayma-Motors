"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { controlClasses } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

/** Password field with a show/hide toggle. Takes the same props as <input> (incl. react-hook-form register()). */
export function PasswordInput({ className, ref, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(controlClasses, "h-10 pr-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-500 hover:text-ink-900"
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
