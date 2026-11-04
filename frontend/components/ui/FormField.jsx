import { CircleAlert } from "lucide-react";
import { Children, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

/**
 * Label + control + helper/error text (Step 5 §3).
 * Wires `id`, `aria-invalid` and `aria-describedby` onto the single child control.
 */
export function FormField({ id, label, required = false, hint, error, className, children }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const control = Children.only(children);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink-900">
          {label}
          {required && (
            <span className="ml-0.5 text-brand-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {isValidElement(control)
        ? cloneElement(control, {
            id,
            required: required || undefined,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": describedBy,
          })
        : control}

      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger-600">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-sm text-zinc-500">
          {hint}
        </p>
      )}
    </div>
  );
}
