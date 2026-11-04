"use client";

import { ErrorView } from "@/components/ErrorView";

export default function PublicError({ error, retry }) {
  return <ErrorView error={error} retry={retry} className="py-24" />;
}
