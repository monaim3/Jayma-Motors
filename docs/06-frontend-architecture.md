# Jayma Motors — Step 6: Frontend Architecture & Implementation Plan (DRAFT)

| Item | Value |
|---|---|
| Status | **Approved 2026-11-01** (FE1 Tiptap, FE2 Sonner, FE3 order F0–F11) |
| Based on | Steps 1–5 (approved) |
| Scope | How the Next.js app is organised and built: versions, folders, routes, data flow, auth, forms, packages, hero animation, SEO, build order. No code yet (Step 8). |

---

## 1. Versions & Setup

| Item | Choice |
|---|---|
| Next.js | Latest stable at project start (App Router, Turbopack dev server) |
| React | Version bundled with that Next.js release |
| Language | JavaScript (`.js` / `.jsx`), `jsconfig.json` with `@/*` alias |
| Styling | Tailwind CSS (latest), design tokens from Step 5 defined as CSS theme variables in `app/globals.css` |
| Package manager | pnpm |
| Node.js | 22 LTS locally (Hostinger supports 20 / 22 / 24) |
| Lint / format | ESLint (Next config) + Prettier + `prettier-plugin-tailwindcss` |

Exact versions are pinned in `package.json` when the project is created in Step 8 and recorded in the README.

---

## 2. Folder Structure

```
frontend/
├── app/
│   ├── layout.js                  # <html>, fonts, global providers (toasts)
│   ├── globals.css                # Tailwind + design tokens
│   ├── not-found.js · error.js · global-error.js
│   ├── sitemap.js · robots.js
│   ├── (public)/                  # Public layout: top bar, header, footer, floating buttons
│   │   ├── layout.js
│   │   ├── page.js                # Home
│   │   ├── about/ why-us/ shell-helix/ terms/ privacy/
│   │   ├── services/ [slug]/
│   │   ├── products/ [slug]/
│   │   ├── gallery/ [album]/
│   │   ├── blog/ [slug]/
│   │   ├── reviews/
│   │   ├── book-appointment/
│   │   ├── service-enquiry/
│   │   └── contact/
│   ├── (auth)/                    # Split-screen auth layout
│   │   ├── layout.js
│   │   ├── login/ register/ forgot-password/ reset-password/ verify-email/
│   ├── admin/login/               # Management login (own minimal dark layout)
│   ├── account/                   # Customer portal (protected)
│   │   ├── layout.js              # Sidebar / bottom nav, AuthProvider
│   │   ├── page.js                # Dashboard
│   │   ├── vehicles/ appointments/ [reference]/ service-history/ [reference]/ reviews/ profile/
│   ├── admin/(panel)/             # Admin panel (protected, role-gated)
│   │   ├── layout.js              # Dark sidebar, top bar, AuthProvider
│   │   ├── page.js                # Dashboard
│   │   ├── appointments/ enquiries/ service-records/ customers/ vehicles/
│   │   ├── reviews/ services/ products/ product-categories/ posts/ gallery/
│   │   ├── client-logos/ pages/ vehicle-brands/ settings/ users/ audit-log/ profile/
│   └── api/revalidate/route.js    # Only Route Handler: Laravel calls it to refresh cached public pages
│
├── components/
│   ├── ui/                        # Button, Input, Select, Badge, Card, Table, Dialog, Drawer, Toast, Skeleton…
│   ├── layout/                    # PublicHeader, PublicFooter, TopBar, FloatingContact, AccountNav, AdminSidebar…
│   ├── forms/                     # FormField, PhoneInput, DateInput, StarRatingInput, ImageUpload, RichTextEditor
│   └── features/                  # Grouped by module
│       ├── home/                  # ScrollBuiltHero, TrustStrip, ServicesGrid, Testimonials…
│       ├── appointments/ enquiries/ reviews/ services/ products/ blog/ gallery/
│       ├── account/ service-records/ customers/ vehicles/ settings/ users/
│
├── lib/
│   ├── api/
│   │   ├── browser-client.js      # Axios instance for Client Components (cookies + XSRF)
│   │   ├── server-fetch.js        # fetch wrapper for Server Components (forwards cookies)
│   │   └── errors.js              # Normalises API errors → { status, message, fieldErrors }
│   ├── auth/                      # getCurrentUser (server), permission helpers
│   ├── format.js                  # money (৳), dates (Asia/Dhaka), phone display
│   ├── constants.js               # statuses, labels, badge colours, nav definitions
│   └── utils.js                   # cn() class merge, misc
│
├── services/                      # One file per API module — the ONLY place with endpoint paths
│   ├── auth.js  appointments.js  enquiries.js  reviews.js  services.js  products.js
│   ├── posts.js  gallery.js  pages.js  settings.js  customers.js  vehicles.js
│   └── service-records.js  users.js  audit-logs.js  uploads.js
│
├── schemas/                       # Zod schemas, one per form (mirror Laravel rules)
├── hooks/                         # useAuth, useDebounce, useUrlFilters, useScrollProgress…
├── context/                       # AuthContext
├── public/
│   ├── brand/                     # Logo SVG/PNG, favicon set, OG image
│   └── hero/                      # Scroll-built hero frames (desktop/ and mobile/)
├── proxy.js                       # Route guard (named middleware.js on older Next.js versions)
├── next.config.mjs
├── jsconfig.json
├── .env.example
└── package.json
```

**Rules**

- Route folders contain only `page.js`, `layout.js`, `loading.js`, `error.js` and route-private `_components/`.
- `components/ui` never calls the API.
- Every endpoint path lives in `services/`; components call service functions, never `axios`/`fetch` directly.
- File names: kebab-case (`service-records.js`); React components: PascalCase files and exports (`ServiceRecordEditor.jsx`).

---

## 3. Rendering Strategy per Area

| Area | Rendering | Data reads | Caching |
|---|---|---|---|
| Public content pages (home, services, products, blog, gallery, pages, reviews list) | Server Components, static + **ISR** | `server-fetch` to public API endpoints | `revalidate: 600` (10 min) + **on-demand revalidation** when admin edits content |
| Public forms (book appointment, enquiry, write review) | Server page shell + Client form component | Dropdown data fetched on the server | — |
| Auth pages | Client forms | — | No cache |
| Customer portal | Dynamic Server Components (read the user's cookie) | `server-fetch` with forwarded cookies | No cache (`no-store`) |
| Admin panel | Dynamic Server Components for page data; Client Components for tables, filters, editors, actions | Same | No cache |

**Mutations** (create/update/status changes) always run in Client Components through `services/*` → `browser-client` → Laravel, then call `router.refresh()` so the Server Component data reloads. No Server Actions are used for business operations (Step 1 rule).

**On-demand revalidation:** when an admin publishes/edits services, products, posts, pages, gallery, reviews, client logos or settings, Laravel sends a signed request to `POST /api/revalidate` with the affected paths/tags. This Route Handler only clears Next.js cache — it contains no business logic.

---

## 4. API Communication

### 4.1 Browser client (`lib/api/browser-client.js`)

- Axios instance: `baseURL = NEXT_PUBLIC_API_URL` (`https://api.jaymamotors.com`, local `http://localhost:8000`).
- `withCredentials: true`, `withXSRFToken: true`, `Accept: application/json`.
- Before login/register/forgot-password, calls `GET /sanctum/csrf-cookie` once.
- Response interceptor:
  - `401` → clear auth state, redirect to the right login page with `?next=` current path.
  - `419` (CSRF expired) → refresh CSRF cookie and retry the request once.
  - `422` → passed to the form as field errors.
  - `429` → toast "Too many attempts, please wait a moment."
  - `5xx` / network → toast with "Try again".

### 4.2 Server fetch (`lib/api/server-fetch.js`)

- Native `fetch` to the same API base URL.
- For authenticated reads it forwards the incoming request's `Cookie` header and sets `Referer`/`Origin` to the site URL (Sanctum uses these to treat the request as first-party).
- Public reads send no cookies and use `next: { revalidate, tags }` for caching.
- `401` on a protected page → `redirect('/login?next=…')`; `403` → `notFound()`-style "No access" page; `404` → `notFound()`.

### 4.3 Service layer example (shape only)

```
services/appointments.js
  listPublicServices()            → GET  /api/v1/services?filter[bookable]=1
  createAppointment(data)         → POST /api/v1/appointments
  listMyAppointments(params)      → GET  /api/v1/me/appointments
  cancelMyAppointment(reference)  → POST /api/v1/me/appointments/{reference}/cancel
  adminList(params)               → GET  /api/v1/admin/appointments
  adminConfirm(id, data)          → POST /api/v1/admin/appointments/{id}/confirm
```

Final endpoint list is defined in Step 7; the service files follow it one-to-one.

---

## 5. Authentication on the Frontend

| Piece | Responsibility |
|---|---|
| `proxy.js` (route guard) | For `/account/*` and `/admin/*` (except `/admin/login`): if the session cookie is missing → redirect to login with `?next=`. Fast, no API call. **Not a security boundary.** |
| Protected layouts (`account/layout.js`, `admin/(panel)/layout.js`) | Server-side call to `GET /api/v1/auth/me`. No user → redirect to login. Wrong type (customer on `/admin`, staff on `/account`) → redirect to their own area. |
| `AuthContext` | Provides `user`, `roles`, `permissions`, `can(permission)` to Client Components inside protected layouts. Used only to show/hide UI. |
| Login (customer) | CSRF cookie → `POST /api/v1/auth/login` (`login` = phone or email, `password`, `remember`) → redirect to `next` or `/account` |
| Login (management) | Same endpoint family with a `staff` login route; redirect to `/admin` |
| Logout | `POST /api/v1/auth/logout` → clear context → redirect to home or management login |
| Email verification | Link opens `/verify-email?…` which calls the API to confirm and shows the result |
| Password reset | `/forgot-password` → email; `/reset-password?token=…&email=…` → new password |

Permission names in the frontend are the same Spatie names as Step 4 §15 (e.g. `service-records.edit-completed`), defined once in `lib/constants.js`.

---

## 6. Forms

| Rule | Detail |
|---|---|
| Library | React Hook Form + Zod via `@hookform/resolvers/zod` |
| Schemas | `schemas/<form>.js`, mirroring Laravel validation (lengths, required, phone format). Laravel stays the authority. |
| Phone | Shared `phoneSchema` accepting `01XXXXXXXXX` / `+880…`; normalised display |
| Server errors | `422` field errors mapped with `setError`; general errors shown in a form-level alert |
| Submit state | Button spinner + disabled; prevents double submit |
| Dirty-state guard | Admin editors warn before leaving with unsaved changes |
| File uploads | Image fields upload first to `POST /api/v1/admin/uploads` → returned path stored in the form; size/type checked on both sides |
| Money inputs | Typed as text with numeric keyboard; sent as strings (e.g. `"1250.00"`); totals displayed from the server response after save |

---

## 7. State Management

| Kind of state | Where it lives |
|---|---|
| Server data | Server Components (fetched per request or cached) |
| List filters, search, pagination, tabs | URL search params (`useUrlFilters` hook) — shareable and back-button friendly |
| Form state | React Hook Form |
| Current user & permissions | `AuthContext` (protected areas only) |
| UI state (drawers, dialogs) | Local component state |
| Global client store | **None in Phase 1 — Redux Toolkit is not installed.** Revisit only if a genuinely shared client state appears. |

---

## 8. Scroll-Built Hero (Step 5 §6.1.1)

| Aspect | Plan |
|---|---|
| Component | `components/features/home/ScrollBuiltHero.jsx` (Client Component) inside a Server-rendered section that contains all text |
| Technique | Sticky section ~400 vh tall; a `<canvas>` draws frame *n* where *n* = scroll progress × frame count; updates on `requestAnimationFrame` only when the frame changes |
| Libraries | **None** — native scroll position + canvas. (GSAP/Lenis not needed for this effect.) |
| Frames | WebP, `public/hero/desktop/0001.webp…` (~100 frames, ~1600 px wide) and `public/hero/mobile/…` (~60 frames, ~800 px) |
| Loading order | 1) final frame as `next/image` with `priority` (instant paint) → 2) first ~10 frames → 3) remaining frames in the background, idle time |
| Captions | 6 stage captions + progress rail driven by the same progress value; real HTML text |
| Fallbacks | `prefers-reduced-motion`, `Save-Data`, or frames failing to load → static final image + captions as a list |
| Placeholder | Until final frames are produced, a generated placeholder sequence is used so the page can be built and tested |

---

## 9. Packages

### 9.1 Approved in Step 1

`next`, `react`, `react-dom`, `tailwindcss` (+ PostCSS plugin), `react-hook-form`, `zod`, `@hookform/resolvers`, `axios`, `lucide-react`, `clsx`, `tailwind-merge`; dev: `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss`.

### 9.2 Proposed additions (each needs approval)

| Package | Why it is needed | Alternative considered |
|---|---|---|
| `@tiptap/react` + `@tiptap/starter-kit` (+ link/image extensions) | Rich text editor for blog posts, pages and service/product descriptions (admin only, loaded only on editor pages) | Plain textarea/Markdown — too hard for non-technical staff |
| `sonner` | Accessible toast notifications (~3 KB) | Hand-built toasts — more code to maintain for little benefit |

### 9.3 Deliberately not used

| Not used | Reason |
|---|---|
| Redux Toolkit | No shared client state in Phase 1 |
| TanStack Query / SWR | Server Components + `router.refresh()` cover data loading |
| UI kits (MUI, Ant Design, etc.) | Own Tailwind components match the brand and stay light |
| Carousel libraries | CSS scroll-snap is enough for testimonials and gallery strips |
| Date libraries (moment, date-fns) | `Intl.DateTimeFormat` with `timeZone: 'Asia/Dhaka'` |
| GSAP / Three.js | Hero uses canvas image sequence (§8) |
| Lightbox libraries | Gallery lightbox built on the shared Dialog component |

---

## 10. SEO Implementation

| Item | Implementation |
|---|---|
| Metadata | Static `metadata` exports; `generateMetadata` for detail pages using API data (meta title/description, OG image) |
| Title template | `%s | Jayma Motors` |
| Canonical URLs | `metadataBase = NEXT_PUBLIC_SITE_URL`; canonical per page |
| `sitemap.js` | Static routes + published services, products, posts, gallery albums from the API |
| `robots.js` | Allow public; disallow `/account`, `/admin`, auth pages |
| Structured data | JSON-LD `AutoRepair` (LocalBusiness) on Home/Contact; `BlogPosting` on posts; `Product` on products (no offers when price is "Call for price") |
| Redirects | Old slugs (Step 4 `slug_redirects`): detail pages ask the API; if a redirect exists → `permanentRedirect()` |
| Noindex | Portal, admin and auth pages |

---

## 11. Images & Assets

- `next/image` everywhere; `remotePatterns` allow `api.jaymamotors.com` (and `localhost:8000` in development) for uploaded images.
- Fixed aspect ratios per image type (service 4:3, product 1:1, blog cover 16:9, gallery original) to avoid layout shift.
- Fonts via `next/font/google` (Montserrat, Inter) — self-hosted at build time, no external font requests.
- Logo as inline SVG component (crisp at any size); favicon set and OG image in `public/brand/`.

---

## 12. Loading, Errors & Empty States

| Situation | Implementation |
|---|---|
| Route loading | `loading.js` per section with skeletons shaped like the final content |
| Route errors | `error.js` per area (public, account, admin) with retry; `global-error.js` as last resort |
| Not found | `not-found.js` (Step 5 §6.11) |
| No access | Shared "You don't have access to this page" view |
| Empty data | Empty-state component with an action |

---

## 13. Environment Variables

| Variable | Exposed to browser | Example |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://jaymamotors.com` |
| `NEXT_PUBLIC_API_URL` | Yes | `https://api.jaymamotors.com` |
| `REVALIDATE_SECRET` | **No** | Long random string shared with Laravel |

`.env.local` for development (git-ignored); production values set in the Hostinger Node.js app settings. `.env.example` is committed without secrets.

---

## 14. Quality Rules

- Server Components by default; `"use client"` only at interactive leaves.
- No business calculations in the frontend (totals, availability, permissions come from the API).
- Every interactive element reachable by keyboard; Step 5 accessibility checklist applied per page.
- Lighthouse targets on public pages (mobile): Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95.
- No secrets in client code; no `dangerouslySetInnerHTML` except for rich text that the API has already sanitised.

---

## 15. Implementation Order (used in Step 8)

Each milestone is built **backend API first, then frontend, then tested together** (vertical slices).

| # | Milestone | Frontend scope |
|---|---|---|
| F0 | Foundation | Project setup, tokens, fonts, UI components, public/auth/account/admin layouts, API clients, error handling |
| F1 | Authentication | Customer register/login/verify/reset, management login, route guard, AuthContext |
| F2 | Settings & content basics | Site settings (header/footer data), pages, services (public + admin) |
| F3 | Appointments | Booking form + confirmation, customer appointments, admin appointments |
| F4 | Customers & vehicles | Portal vehicles/profile, admin customers/vehicles, account linking |
| F5 | Service records | Admin editor, customer service history |
| F6 | Enquiries | Public form, admin enquiries + convert |
| F7 | Reviews | Public reviews + form, moderation, home testimonials |
| F8 | Products, blog, gallery, client logos | Public pages + admin editors |
| F9 | Home page & hero | All home sections + scroll-built hero |
| F10 | Dashboard, users, audit log | Admin dashboard widgets, staff users, audit log |
| F11 | SEO & polish | Sitemap, structured data, redirects, accessibility and performance pass |

---

## 16. Decisions Requested

| # | Item | Proposed |
|---|---|---|
| FE1 | Add Tiptap (rich text editor, admin only) | Yes |
| FE2 | Add Sonner (toasts) | Yes |
| FE3 | Implementation order F0–F11 | As listed |
