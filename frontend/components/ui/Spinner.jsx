import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, label = "Loading" }) {
  return <LoaderCircle aria-label={label} role="status" className={cn("size-5 animate-spin", className)} />;
}
