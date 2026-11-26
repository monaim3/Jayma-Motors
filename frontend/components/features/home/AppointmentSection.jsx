"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Car, CarFront, CircleUserRound, Hash, LoaderCircle, Mail, Phone, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Container } from "@/components/ui/Container";
import { api, ensureCsrfCookie } from "@/lib/api/browser-client";
import { applyFieldErrors } from "@/lib/api/errors";
import { VEHICLE_BRANDS } from "@/lib/home-content";
import { cn } from "@/lib/utils";

// Same rule as the backend PhoneNumber helper: 01XXXXXXXXX, 8801… or +8801…
const BD_MOBILE = /^(?:\+?88)?01[3-9]\d{8}$/;

const schema = z.object({
  contact_name: z.string().trim().min(2, "Please enter your name.").max(100),
  contact_phone: z
    .string()
    .trim()
    .refine((value) => BD_MOBILE.test(value.replace(/[\s\-().]/g, "")), "Enter a valid mobile number (01XXXXXXXXX)."),
  contact_email: z.union([z.literal(""), z.email("Enter a valid email address.")]),
  preferred_date: z
    .string()
    .min(1, "Choose a date.")
    .refine((value) => value >= today(), "Choose today or a later date."),
  vehicle_brand: z.string().min(1, "Choose your car brand."),
  vehicle_model: z.string().trim().min(1, "Enter your car model.").max(60),
  registration_number: z.string().trim().min(3, "Enter your car number.").max(40),
  service: z.string().min(1, "Choose a service."),
  website: z.string().max(0).optional(), // honeypot
});

const EMPTY = {
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  preferred_date: "",
  vehicle_brand: "",
  vehicle_model: "",
  registration_number: "",
  service: "",
  website: "",
};

/*
 * A guest's booking details while they log in or sign up. sessionStorage: kept
 * across the trip to /login and back in the same tab, gone when it's closed.
 * Expires after an hour so an old half-booking doesn't reappear later.
 */
const DRAFT_KEY = "jayma:booking-draft";
const DRAFT_TTL = 60 * 60 * 1000;

function saveDraft(values) {
  try {
    const { website, ...fields } = values; // never keep the spam-trap field
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ at: Date.now(), fields }));
  } catch {
    // Storage blocked (private mode): they'll just fill the form again.
  }
}

function readDraft() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null");
    return saved && Date.now() - saved.at < DRAFT_TTL ? saved.fields : null;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

/** The signed-in user (GET /auth/me), or null for guests. No call without a session cookie. */
function fetchViewer() {
  if (!document.cookie.includes("XSRF-TOKEN")) return Promise.resolve(null);
  return api
    .get("/auth/me")
    .then(({ data }) => data.data)
    .catch(() => null);
}

/** Today in the visitor's timezone as YYYY-MM-DD (for the date picker's minimum). */
function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** Outlined, transparent field: uppercase label and icon inside the box (reference-site style). */
function Field({ id, label, icon: Icon, required, error, className, children }) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={cn(
          "block border px-4 pt-3 pb-2 transition-colors focus-within:border-brand-500 focus-within:bg-white/5",
          error ? "border-danger-600" : "border-white/35 hover:border-white/60",
        )}
      >
        <span className="block text-sm font-semibold tracking-wide text-white uppercase">
          {label}
          {required && (
            <span className="ml-1 text-brand-500" aria-hidden="true">
              *
            </span>
          )}
        </span>
        <span className="mt-1.5 flex items-center gap-3">
          <Icon className="size-5 shrink-0 text-zinc-300" aria-hidden="true" />
          {children}
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

const controlClass =
  "h-8 w-full min-w-0 bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none [color-scheme:dark]";

/**
 * Home appointment form (Step 2 M2), transparent over a dark backdrop.
 * Posts to POST /api/v1/appointments (backend milestone B3). Booking needs an
 * account (owner, 2026-11-26): a guest is sent to log in or sign up and comes
 * back to this form with their details restored.
 */
export function AppointmentSection({ services, phone }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });
  const preferredDate = useWatch({ control, name: "preferred_date" });
  // An empty date input shows the browser's "mm/dd/yyyy"; hide it until focused.
  const dateEmpty = !preferredDate;

  /**
   * Bookable dates (GET /appointments/availability): first/last day for the
   * date picker, plus closed and fully booked days. Loaded the first time
   * the date field is used, so the page itself stays static.
   */
  const [availability, setAvailability] = useState(null);
  const availabilityRequest = useRef(null);
  const loadAvailability = () => {
    availabilityRequest.current ??= api
      .get("/appointments/availability")
      .then(({ data }) => setAvailability(data.data))
      .catch(() => {
        availabilityRequest.current = null; // the server still checks on submit
      });
  };

  // A browser date picker can't grey out single days, so say so as soon as one is picked.
  useEffect(() => {
    if (!availability || !preferredDate) return;
    if (availability.closed_dates.includes(preferredDate)) {
      setError("preferred_date", {
        type: "closed",
        message: "The workshop is closed on this day. Please choose another date.",
      });
    } else if (availability.full_dates.includes(preferredDate)) {
      setError("preferred_date", { type: "full", message: "This day is fully booked. Please choose another date." });
    }
  }, [availability, preferredDate, setError]);

  /**
   * Who is booking (owner, 2026-11-26: booking needs an account). Logged-in
   * customers get their details pre-filled and their saved cars offered. A
   * guest's filled-in form is kept in the browser while they log in or sign
   * up, and restored here when they come back (?booking=resume).
   * "checking" until known; only asks the API when a session cookie exists.
   */
  const router = useRouter();
  const [viewer, setViewer] = useState("checking"); // checking | guest | customer | staff
  const [myCars, setMyCars] = useState([]);
  const [chosenCar, setChosenCar] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchViewer().then(async (user) => {
      if (cancelled) return;
      setViewer(user ? user.type : "guest");
      if (user?.type !== "customer") return;

      // Back from login/sign-up: put the guest's booking details back first.
      const draft = readDraft();
      if (draft) {
        clearDraft();
        Object.entries(draft).forEach(([name, value]) => value && setValue(name, value));
        window.history.replaceState(null, "", "/#appointment");
        document.getElementById("appointment")?.scrollIntoView({ behavior: "smooth" });
        toast.success(`Welcome, ${user.name.split(" ")[0]}! Your booking details are back`, {
          description: "Check them and tap Book appointment.",
        });
      }

      const fill = (name, value) => {
        const input = document.getElementById(`apt-${name}`);
        if (value && input && !input.value) setValue(name, value);
      };
      fill("contact_name", user.name);
      fill("contact_phone", user.phone?.replace(/^\+88/, ""));
      fill("contact_email", user.email);
      const cars = await api.get("/me/vehicles").catch(() => null);
      if (!cancelled && cars) setMyCars(cars.data.data);
    });
    return () => {
      cancelled = true;
    };
  }, [setValue]);

  const pickCar = (car) => {
    setChosenCar(car);
    const brand = VEHICLE_BRANDS.includes(car.brand_name) ? car.brand_name : "Other";
    setValue("vehicle_brand", brand, { shouldValidate: true });
    setValue("vehicle_model", car.model, { shouldValidate: true });
    setValue("registration_number", car.registration_number, { shouldValidate: true });
  };

  // Service cards link to "#book-<slug>": pick that service and bring the form into view.
  useEffect(() => {
    const onHash = () => {
      const slug = window.location.hash.match(/^#book-(.+)$/)?.[1];
      if (!slug || !services.some((service) => service.slug === slug)) return;
      setValue("service", slug, { shouldValidate: true });
      // Reset the hash so clicking the same card again still fires `hashchange`.
      window.history.replaceState(null, "", "#appointment");
      document.getElementById("appointment")?.scrollIntoView({ behavior: "smooth" });
      // preventScroll: a plain focus() would cancel the smooth scroll.
      document.getElementById("apt-contact_name")?.focus({ preventScroll: true });
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [setValue, services]);

  const onSubmit = async (values) => {
    if (
      availability?.closed_dates.includes(values.preferred_date) ||
      availability?.full_dates.includes(values.preferred_date)
    ) {
      setError(
        "preferred_date",
        { type: "unavailable", message: "Please choose another date." },
        { shouldFocus: true },
      );
      return;
    }

    // Guests log in or sign up first; their details wait in the browser meanwhile.
    const who = viewer === "checking" ? ((await fetchViewer())?.type ?? "guest") : viewer;
    if (who === "guest") {
      saveDraft(values);
      toast("Log in or create an account to finish your booking", {
        description: "Your details are saved — you won't need to type them again.",
      });
      router.push(`/login?next=${encodeURIComponent("/?booking=resume#appointment")}`);
      return;
    }

    try {
      await ensureCsrfCookie();
      // A saved car that wasn't edited afterwards is sent by id (keeps its exact details).
      const sameCar =
        chosenCar &&
        chosenCar.registration_number.replace(/\W/g, "").toUpperCase() ===
          values.registration_number.replace(/\W/g, "").toUpperCase();
      const { data } = await api.post("/appointments", sameCar ? { ...values, vehicle_id: chosenCar.id } : values);
      reset({
        ...EMPTY,
        contact_name: values.contact_name,
        contact_phone: values.contact_phone,
        contact_email: values.contact_email,
      });
      setChosenCar(null);
      toast.success("Appointment request received", {
        description: data?.data?.reference
          ? `Reference ${data.data.reference}. We'll call you to confirm.`
          : "We'll call you to confirm.",
      });
    } catch (error) {
      if (applyFieldErrors(error, setError)) return;
      // 409: the same car is already booked for that day (or too many tries: 429).
      if (error?.status === 409 || error?.status === 429) {
        toast.error(error.message, { description: `Questions? Call us on ${phone}.` });
        return;
      }
      toast.error("Couldn't send your booking", {
        description: `Please try again, or call us on ${phone}.`,
      });
    }
  };

  const fieldProps = (name) => ({
    id: `apt-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `apt-${name}-error` : undefined,
    ...register(name),
  });

  return (
    <section
      id="appointment"
      aria-labelledby="appointment-heading"
      // -mt-px: the hero's vh-based height ends on a fractional pixel; overlap it so no white seam shows.
      className="relative -mt-px scroll-mt-20 overflow-hidden bg-[linear-gradient(to_bottom,var(--color-ink-950)_70%,transparent)] text-white"
    >
      {/*
        Backdrop continues the hero's floor (same grid, same red glow) so the
        hero and the form read as one dark block, not two sections.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_70%_55%,var(--color-brand-900),transparent_75%)] opacity-60"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent)] bg-[size:48px_48px] bg-[position:left_24px]"
      />

      <Container className="relative pt-6 pb-10 2xl:pb-15">
        <h2 id="appointment-heading" className="sr-only">
          Book an appointment
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {myCars.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold tracking-wide text-zinc-300 uppercase">Your cars:</span>
              {myCars.map((car) => (
                <button
                  key={car.id}
                  type="button"
                  onClick={() => pickCar(car)}
                  aria-pressed={chosenCar?.id === car.id}
                  className={cn(
                    "inline-flex items-center gap-2 border px-3 py-1.5 text-sm transition-colors",
                    chosenCar?.id === car.id
                      ? "border-brand-500 bg-brand-600 text-white"
                      : "border-white/35 text-zinc-200 hover:border-white/70",
                  )}
                >
                  <Car className="size-4" aria-hidden="true" />
                  {car.brand_name} {car.model} · {car.registration_number}
                </button>
              ))}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-6">
            <Field
              id="apt-contact_name"
              label="Name"
              icon={CircleUserRound}
              required
              error={errors.contact_name?.message}
            >
              <input type="text" autoComplete="name" className={controlClass} {...fieldProps("contact_name")} />
            </Field>
            <Field id="apt-contact_phone" label="Phone" icon={Phone} required error={errors.contact_phone?.message}>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className={controlClass}
                {...fieldProps("contact_phone")}
              />
            </Field>
            <Field id="apt-contact_email" label="Email" icon={Mail} error={errors.contact_email?.message}>
              <input type="email" autoComplete="email" className={controlClass} {...fieldProps("contact_email")} />
            </Field>
            <Field
              id="apt-preferred_date"
              label="Date"
              icon={CalendarDays}
              required
              error={errors.preferred_date?.message}
            >
              <input
                type="date"
                // Set on interaction: reading the clock during render breaks prerendering.
                // The workshop's own dates (Dhaka) win once availability has loaded.
                min={availability?.today}
                max={availability?.max_date}
                onFocus={(event) => {
                  loadAvailability();
                  if (!availability) event.currentTarget.min = today();
                }}
                onPointerDown={(event) => {
                  loadAvailability();
                  if (!availability) event.currentTarget.min = today();
                }}
                className={cn(controlClass, dateEmpty && "text-transparent focus:text-white")}
                {...fieldProps("preferred_date")}
              />
            </Field>

            <Field
              id="apt-vehicle_brand"
              label="Car brand"
              icon={CarFront}
              required
              error={errors.vehicle_brand?.message}
            >
              <select className={cn(controlClass, "cursor-pointer")} {...fieldProps("vehicle_brand")}>
                <option value="" className="bg-ink-900">
                  Select brand
                </option>
                {VEHICLE_BRANDS.map((brand) => (
                  <option key={brand} value={brand} className="bg-ink-900">
                    {brand}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="apt-vehicle_model" label="Car model" icon={Car} required error={errors.vehicle_model?.message}>
              <input type="text" className={controlClass} {...fieldProps("vehicle_model")} />
            </Field>
            <Field
              id="apt-registration_number"
              label="Car number"
              icon={Hash}
              required
              error={errors.registration_number?.message}
            >
              <input type="text" className={controlClass} {...fieldProps("registration_number")} />
            </Field>
            <Field id="apt-service" label="Services" icon={Settings} required error={errors.service?.message}>
              <select className={cn(controlClass, "cursor-pointer")} {...fieldProps("service")}>
                <option value="" className="bg-ink-900">
                  Select service
                </option>
                {services.map((service) => (
                  <option key={service.slug} value={service.slug} className="bg-ink-900">
                    {service.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Honeypot: hidden from people, bots fill it in. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
            {...register("website")}
          />

          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-14 min-w-64 items-center justify-center gap-2 rounded-control bg-brand-600 px-10 text-sm font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-brand-700 disabled:opacity-70"
            >
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
              Book appointment
            </button>
          </div>
        </form>
      </Container>
    </section>
  );
}
