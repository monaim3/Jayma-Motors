import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import logo from "@/public/brand/logo.png";
import logoWhite from "@/public/brand/logo-white.png";

/**
 * Jayma Motors logo. `variant="white"` for dark backgrounds.
 * Height is set by className (e.g. "h-10"); width follows the logo's ratio.
 */
export function Logo({ variant = "color", href = "/", className, preload = false }) {
  const image = (
    <Image
      src={variant === "white" ? logoWhite : logo}
      alt="Jayma Motors"
      preload={preload}
      sizes="160px"
      className={cn("h-10 w-auto", className)}
    />
  );

  return href ? (
    <Link href={href} aria-label="Jayma Motors home" className="inline-flex shrink-0">
      {image}
    </Link>
  ) : (
    image
  );
}
