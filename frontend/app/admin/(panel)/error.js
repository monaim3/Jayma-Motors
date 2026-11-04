"use client";

import { ErrorView } from "@/components/ErrorView";

export default function AdminError({ error, retry }) {
  return <ErrorView error={error} retry={retry} />;
}
