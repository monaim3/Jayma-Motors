"use client";

import { CalendarCheck, CircleUserRound, Mail, MapPin, Phone, Wrench, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PUBLIC_NAV } from "@/lib/constants";
import { FALLBACK_SERVICES, FALLBACK_SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

function isActive(pathname, href) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

const iconLink =
  "flex size-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 hover:text-brand-500";

/** Laptop mega menu (reference-site style): three titled columns. Services come from the API. */
const megaColumns = (services) => [
  {
    title: "Discover us",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/gallery", label: "Gallery" },
      { href: "/reviews", label: "Reviews" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Services",
    links: [
      ...services.slice(0, 5).map((service) => ({ href: `/services/${service.slug}`, label: service.name })),
      { href: "/services", label: "All Services" },
    ],
  },
  {
    title: "Quick links",
    links: [
      { href: "/book-appointment", label: "Book Appointment" },
      { href: "/service-enquiry", label: "Service Enquiry" },
      { href: "/products", label: "Products & Lubricants" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
];

/** @param site, services - from the public layout (Laravel settings/services, or the built-in copy). */
export function PublicHeader({ site = FALLBACK_SITE, services = FALLBACK_SERVICES }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const megaCloseButtonRef = useRef(null);

  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const menuButton = menuButtonRef.current;
    // Focus the close button of whichever menu is showing (side panel or laptop mega menu).
    const closeButton = [megaCloseButtonRef.current, closeButtonRef.current].find((button) => button?.offsetParent);
    closeButton?.focus();
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      menuButton?.focus();
    };
  }, [open]);

  return (
    <>
      {/*
        Transparent header over the dark page hero (reference-site layout):
        menu button left, logo centre, call / WhatsApp / account right.
        Nav items live in the slide-in menu. After scrolling the bar turns
        dark and blurred so it stays readable over light sections.
      */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 text-white transition-[background-color,box-shadow,border-color] duration-300",
          scrolled
            ? "border-b border-white/10 bg-ink-950/85 shadow-lg shadow-black/20 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        {/* Big logo at the top of the page; shrinks with the bar once scrolled. */}
        <Container
          className={cn(
            "grid grid-cols-[1fr_auto_1fr] items-center gap-4 transition-[height] duration-300",
            scrolled ? "h-20 lg:h-24" : "h-24 lg:h-28",
          )}
        >
          <div className="flex items-center">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen(true)}
              className="group -ml-2 flex size-12 flex-col items-start justify-center gap-[7px] rounded-control px-2"
            >
              <span className="h-0.5 w-8 bg-white transition-all group-hover:w-6 group-hover:bg-brand-500" />
              <span className="h-0.5 w-8 bg-white transition-all group-hover:bg-brand-500" />
              <span className="h-0.5 w-8 bg-white transition-all group-hover:w-5 group-hover:bg-brand-500" />
            </button>
          </div>

          <Logo
            variant="white"
            preload
            sizes="(min-width: 1024px) 180px, 130px"
            className={cn("transition-[height] duration-300", scrolled ? "h-11 lg:h-14" : "h-14 lg:h-20")}
          />

          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <p className="mr-3 hidden text-sm text-zinc-200 lg:block">
              Call us now:{" "}
              <a
                href={site.phoneHref}
                className="font-semibold text-white underline-offset-4 hover:text-brand-500 hover:underline"
              >
                {site.phone}
              </a>
            </p>
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className={cn(iconLink, "hidden sm:flex")}
            >
              <WhatsAppIcon className="size-6" />
            </a>
            <Link href="/login" aria-label="Login" className={iconLink}>
              <CircleUserRound className="size-7" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </header>

      {/* Slide-in menu — kept outside <header>: its backdrop-blur would trap position:fixed children. */}
      <div className={cn("fixed inset-0 z-50", open ? "visible" : "invisible")} aria-hidden={!open}>
        <div
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={close}
        />
        {/* Laptop+: full-screen mega menu. */}
        <div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "absolute inset-0 hidden flex-col overflow-y-auto bg-ink-950 text-white transition-[opacity,transform] duration-300 ease-out lg:flex",
            "bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgb(93_21_20/0.55),transparent_70%)]",
            open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
          )}
        >
          <Container className="flex h-24 shrink-0 items-center justify-between">
            <Logo variant="white" className="h-14" />
            <button
              ref={megaCloseButtonRef}
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="flex size-12 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 hover:text-brand-500"
            >
              <X className="size-8" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </Container>

          <nav aria-label="Main" className="flex flex-1 items-center py-10">
            <Container className="grid grid-cols-3 gap-10">
              {megaColumns(services).map((column) => (
                <div key={column.title} className="text-center">
                  <p className="text-lg font-medium tracking-[0.4em] text-white uppercase">{column.title}</p>
                  <div aria-hidden="true" className="mx-auto mt-6 flex max-w-72 items-center gap-4 text-brand-500">
                    <span className="h-px flex-1 bg-white/20" />
                    <Wrench className="size-5" strokeWidth={1.5} />
                    <span className="h-px flex-1 bg-white/20" />
                  </div>
                  <ul className="mt-8 space-y-5">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={close}
                          aria-current={isActive(pathname, link.href) ? "page" : undefined}
                          className={cn(
                            "text-lg tracking-[0.12em] transition-colors",
                            isActive(pathname, link.href) ? "text-brand-500" : "text-zinc-300 hover:text-brand-500",
                          )}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Container>
          </nav>
          {/* Balances the logo bar so the columns sit in the visual centre. */}
          <div aria-hidden="true" className="h-24 shrink-0" />
        </div>

        {/* Phones/tablets: slide-in side panel. */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "absolute inset-y-0 left-0 flex w-full max-w-sm [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.2)_transparent] flex-col overflow-y-auto bg-ink-950 text-white shadow-2xl transition-transform duration-300 ease-out",
            "bg-[radial-gradient(ellipse_at_0%_100%,var(--color-brand-900),transparent_60%)]",
            open ? "translate-x-0" : "-translate-x-full",
            "lg:hidden",
          )}
        >
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-6">
            <Logo variant="white" className="h-10" />
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="flex size-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 hover:text-brand-500"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Main mobile" className="flex-1 px-6 py-5">
            <ul className="space-y-1">
              {PUBLIC_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className={cn(
                      "block py-1.5 font-display text-[1.75rem] leading-tight font-medium transition-colors",
                      isActive(pathname, item.href) ? "text-brand-500" : "text-white hover:text-brand-500",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-5 border-t border-white/10 px-6 py-6">
            <div className="grid gap-2">
              <Button href="/book-appointment" className="w-full" onClick={close}>
                <CalendarCheck aria-hidden="true" />
                Book Appointment
              </Button>
              <Button href="/login" variant="outline-light" className="w-full" onClick={close}>
                <CircleUserRound aria-hidden="true" />
                Login
              </Button>
            </div>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              <li>
                <a href={site.phoneHref} className="inline-flex items-center gap-2.5 hover:text-white">
                  <Phone className="size-4 text-brand-500" aria-hidden="true" />
                  {site.phone}
                </a>
              </li>
              {site.hotline && (
                <li>
                  <a href={site.hotlineHref} className="inline-flex items-center gap-2.5 hover:text-white">
                    <Phone className="size-4 text-brand-500" aria-hidden="true" />
                    {site.hotline} (hotline)
                  </a>
                </li>
              )}
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2.5 hover:text-white">
                  <Mail className="size-4 text-brand-500" aria-hidden="true" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden="true" />
                Vatara, Dhaka
              </li>
              {site.social.facebook && (
                <li>
                  <a
                    href={site.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white hover:text-brand-500"
                  >
                    Facebook
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
