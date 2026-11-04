"use client";

import { ErrorView } from "@/components/ErrorView";

export default function AccountError({ error, retry }) {
  return <ErrorView error={error} retry={retry} />;
}
