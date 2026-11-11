import {
  BatteryCharging,
  Car,
  CircleDot,
  ClipboardCheck,
  Cog,
  Cpu,
  Droplets,
  Fan,
  Gauge,
  Hammer,
  PaintRoller,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { createElement } from "react";

/**
 * Service icons by name — the same list the admin panel allows
 * (backend App\Models\Service::ICONS). Unknown names fall back to Wrench.
 */
export const SERVICE_ICONS = {
  BatteryCharging,
  Car,
  CircleDot,
  ClipboardCheck,
  Cog,
  Cpu,
  Droplets,
  Fan,
  Gauge,
  Hammer,
  PaintRoller,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Wrench,
  Zap,
};

export const serviceIcon = (name) => SERVICE_ICONS[name] ?? Wrench;

/** <ServiceIcon name="Cog" className="size-5" /> — renders the icon chosen in the admin panel. */
export function ServiceIcon({ name, ...props }) {
  return createElement(serviceIcon(name), { "aria-hidden": true, ...props });
}
