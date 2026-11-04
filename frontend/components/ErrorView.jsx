"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/constants";

/** Shared error screen for error.js boundaries (Step 6 §12). */
export function ErrorView({ error, retry, className = "py-16" }) {
  const status = error && typeof error === "object" ? error.status : undefined;
  const forbidden = status === 403;

  return (
    <div role="alert" className={`flex flex-col items-center px-4 text-center ${className}`}>
      <h1 className="text-2xl font-bold">
        {forbidden ? "You don't have access to this page" : "Something went wrong"}
      </h1>
      <p className="mt-2 max-w-md text-zinc-600">
        {forbidden
          ? "Ask a Super Admin if you need access."
          : `Please try again. If the problem continues, call us at ${SITE.phone}.`}
      </p>
      {!forbidden && (
        <Button className="mt-6" onClick={() => retry()}>
          <RotateCw aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}
