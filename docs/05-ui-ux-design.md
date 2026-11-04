# Jayma Motors — Step 5: UI/UX Design System & Page-by-Page Design (DRAFT)

| Item | Value |
|---|---|
| Status | **Approved 2026-11-01** |
| Based on | Steps 1–4 (approved), Jayma Motors Facebook branding, reference site layout |
| Scope | Visual language, components, layouts, and the content/sections of every page. Implementation details are Step 6. |

Items marked **[ASSET]** need files from the owner (logo, photos).

---

## 1. Design Principles

1. **Trust first.** A workshop handles expensive cars: clean layout, real photos, clear contact details, visible reviews.
2. **Booking is always one tap away.** "Book Appointment" in the header, on the home hero, at the end of every service page, and as a sticky button on mobile.
3. **Mobile first.** Most visitors arrive from Facebook on a phone.
4. **Brand-consistent.** Red, black and white, matching the JM logo and the Facebook cover.
5. **Calm dashboards.** Admin and customer areas are light, neutral and data-focused; red is used only for primary actions and alerts.
6. **Accessible.** WCAG 2.1 AA contrast, keyboard use, visible focus, labelled fields.

---

## 2. Brand

### 2.1 Logo

- **Received 2026-11-01:** [assets/brand/logo-source.jpg](assets/brand/logo-source.jpg) (1600 × 900 JPG, light-gray background).
- Elements: car-silhouette swoosh (black + red with a red-to-dark gradient), "J" in black, "M" in red, wordmark "JAYMA MOTORS" in a squared, extended typeface.
- Still needed **[ASSET]**: a **transparent** version (SVG preferred, or PNG ≥ 2000 px wide) and a **white version** for dark backgrounds. If the designer's source file is not available, the logo is redrawn as SVG from the JPG during Step 8.
- Favicon (JM mark only) and social share image are produced from the logo.

### 2.2 Colour tokens

Brand values are sampled from the received logo.

| Token | Value | Use |
|---|---|---|
| `brand-600` | `#C42927` | Logo red — primary buttons, links, active nav, key accents (white text on it ≈ 5.7:1, passes AA) |
| `brand-500` | `#E0403E` | Lighter logo-hue red for red text on dark backgrounds (≈ 4.5:1 on `ink-950`) |
| `brand-700` | `#A2221F` | Button hover/pressed |
| `brand-900` | `#5D1514` | Dark end of the logo swoosh gradient; red-to-dark accents on the hero |
| `brand-50` | `#FCEBEA` | Subtle red backgrounds (selected rows, highlights) |
| `logo-black` | `#1F1F1F` | Logo black; dark UI surfaces |
| `ink-950` | `#0E0E10` | Darkest sections (hero, footer), headings |
| `ink-900` | `#18181B` | Body text on light backgrounds |
| `gray-600` | `#52525B` | Secondary text |
| `gray-300` | `#D4D4D8` | Borders, dividers |
| `gray-100` | `#F4F4F5` | Page background in dashboards, alternating sections |
| `white` | `#FFFFFF` | Cards, surfaces |
| `success-600` | `#16A34A` | Completed, approved |
| `warning-500` | `#F59E0B` | Pending, attention |
| `info-600` | `#2563EB` | Confirmed, informational |
| `danger-600` | `#DC2626` | Errors, destructive actions (distinct use from brand red: always paired with an icon/text) |

Contrast rules: body text `ink-900` on white (≈ 17:1); white text on `brand-600` (≈ 5:1, passes AA); never red text on dark backgrounds below 18 px.

### 2.3 Status colours (badges)

| Status | Colour |
|---|---|
| Pending, New | warning (amber) |
| Confirmed, Contacted, In Progress | info (blue) |
| Checked-in | violet `#7C3AED` |
| Completed, Approved, Converted, Published | success (green) |
| Cancelled, Rejected, No-show | gray |
| Expired, Closed, Draft | gray outline |

Badges always show text, never colour alone.

### 2.4 Typography

| Role | Font | Weights |
|---|---|---|
| Headings | **Montserrat** (Google Fonts via `next/font`) — strong, automotive feel | 600, 700, 800 |
| Body & UI | **Inter** | 400, 500, 600 |

| Style | Size / line height (mobile → desktop) |
|---|---|
| Display (home hero) | 36/44 → 56/64, Montserrat 800 |
| H1 | 30/38 → 40/48 |
| H2 | 24/32 → 32/40 |
| H3 | 20/28 → 24/32 |
| Body | 16/26 |
| Small | 14/20 |
| Caption / label | 12/16, 500 |

### 2.5 Spacing, shape, elevation

| Token | Value |
|---|---|
| Spacing scale | Tailwind default (4 px base) |
| Section padding (public) | 64 px mobile → 96 px desktop vertical |
| Container | max 1280 px, 16 px side gutter on mobile, 24–32 px on desktop |
| Radius | 8 px inputs/buttons, 12 px cards, 9999 px pills/badges |
| Shadow | `sm` for cards, `lg` for dropdowns/modals only |
| Icons | Lucide, 20 px default, 1.75 stroke |

### 2.6 Breakpoints (Tailwind defaults)

`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280. Designs are specified for **mobile (360–430 px)**, **tablet (768 px)** and **desktop (1280 px+)**.

### 2.7 Imagery [ASSET]

- Real workshop photos: lifts, technicians at work, painting booth, alignment machine, customer cars (the Facebook posts show good material).
- Dark gradient overlay on hero photos so white text stays readable.
- All images served through `next/image` (WebP/AVIF, lazy loading, fixed aspect ratios to avoid layout shift).

### 2.8 Formatting

| Item | Format |
|---|---|
| Money | `৳ 1,250.00` |
| Date | `01 Nov 2026` |
| Date + time | `01 Nov 2026, 10:30 AM` |
| Phone | `01711-949110` (display); tappable `tel:` links |
| Reference numbers | Monospace, e.g. `SR-2026-00045` |

---

## 3. Component Library

Every component has these states where applicable: default, hover, focus (visible 2 px ring), active, disabled, loading, error.

| Component | Variants / notes |
|---|---|
| Button | Primary (red), Secondary (dark), Outline, Ghost, Destructive; sizes sm/md/lg; icon-only with aria-label; loading spinner |
| Text input, Textarea | Label above, helper text, error text below in red with icon; required marker `*` |
| Phone input | `01XXXXXXXXX` placeholder, numeric keyboard on mobile |
| Select | Native select styled (accessible, mobile-friendly) |
| Searchable select | For long lists (customers, vehicles) in admin |
| Date input | Native date picker; closed days and past dates rejected with a clear message |
| Checkbox, Radio, Switch | |
| Star rating | Input (1–5, keyboard operable) and display |
| File / image upload | Drag-and-drop + click; preview; size/type errors; alt-text field |
| Rich text editor | Admin only (blog, pages, service descriptions); library chosen in Step 6 |
| Badge | Status colours (§2.3) |
| Card | Service card, product card, blog card, review card, stat card |
| Table | Admin lists: sortable headers, row actions menu, sticky header; becomes stacked cards on mobile |
| Filters bar | Search box + status/date filters; filters reflected in the URL |
| Pagination | Previous/next + page numbers; shows "Showing 1–15 of 120" |
| Tabs | |
| Breadcrumbs | Public detail pages and admin |
| Modal / Dialog | Confirmations (cancel, delete); focus trapped; Esc closes |
| Drawer | Mobile navigation, admin sidebar on mobile |
| Toast | Success/error feedback after actions, auto-dismiss 5 s |
| Alert / Banner | Inline info/warning/error (e.g. "Verify your email to see service history") |
| Empty state | Icon + message + action (e.g. "No vehicles yet — Add vehicle") |
| Skeleton | Loading placeholders matching final layout |
| Timeline | Appointment/service status history |
| Floating contact buttons | WhatsApp + Call, bottom-right on public pages |

---

## 4. Layouts

### 4.1 Public layout

```
┌────────────────────────────────────────────────────────────┐
│ Top bar (dark): ☎ 01711-949110 · ✉ email · hours · social  │  ← hidden on mobile except phone
├────────────────────────────────────────────────────────────┤
│ [JM logo]  Home About Services Products Gallery Blog       │
│            Reviews Contact          [Book Appointment] [Login]│
├────────────────────────────────────────────────────────────┤
│                       PAGE CONTENT                          │
├────────────────────────────────────────────────────────────┤
│ Footer (dark): logo + tagline · quick links · services ·    │
│ contact + map link · social · "Since 2012" · legal links    │
│ · Management login (small)                                 │
└────────────────────────────────────────────────────────────┘
  Floating: [WhatsApp] [Call]          Mobile sticky: [Book Appointment]
```

- Header becomes sticky with a white background after scrolling.
- Mobile: logo + hamburger; menu opens as a full-height drawer with large tap targets, phone and WhatsApp buttons at the bottom.
- "More" items (Why Us, Shell Helix Lubricants, Service Enquiry) appear under About/Products dropdowns and in the footer.

### 4.2 Auth layout

Centered card (max 440 px) on a split screen: left half workshop photo with logo and tagline (desktop only), right half the form. Mobile shows only the form with the logo on top.

### 4.3 Customer portal layout

- Desktop: left sidebar (Dashboard, My Vehicles, Appointments, Service History, My Reviews, Profile, Logout) + top bar with name and "Book Appointment".
- Mobile: top bar + **bottom navigation** (Home, Vehicles, Bookings, History, Profile).
- Banner area at top for alerts (unverified email).

### 4.4 Admin layout

- Desktop: collapsible dark sidebar (`ink-950`) grouped as **Operations** (Dashboard, Appointments, Enquiries, Service Records, Customers, Vehicles), **Website** (Services, Products, Blog, Gallery, Reviews, Client Logos, Pages), **System** (Settings, Users, Audit Log). Items hidden when the role lacks permission.
- Top bar: page title, global search (customers by name/phone, vehicles by registration, references), user menu.
- Content area on `gray-100` with white cards.
- Mobile/tablet: sidebar becomes a drawer; tables become cards.

---

## 5. Sitemap & URLs

### Public

| URL | Page |
|---|---|
| `/` | Home |
| `/about` | About Us |
| `/why-us` | Why Us |
| `/services` · `/services/[slug]` | Services list · Service detail |
| `/products` · `/products/[slug]` | Lubricants & Parts list · Product detail |
| `/shell-helix` | Shell Helix Lubricants (special page, D11) |
| `/gallery` · `/gallery/[album]` | Gallery |
| `/blog` · `/blog/[slug]` | Blog list · Post |
| `/reviews` | Reviews + write a review |
| `/book-appointment` | Appointment booking |
| `/service-enquiry` | Service enquiry |
| `/contact` | Contact |
| `/terms` · `/privacy` | Legal |

### Auth

`/login` · `/register` · `/forgot-password` · `/reset-password` · `/verify-email` · `/admin/login`

### Customer portal

`/account` · `/account/vehicles` · `/account/appointments` · `/account/appointments/[reference]` · `/account/service-history` · `/account/service-history/[reference]` · `/account/reviews` · `/account/profile`

### Admin

`/admin` · `/admin/appointments` (+ `/[id]`) · `/admin/enquiries` (+ `/[id]`) · `/admin/service-records` (+ `/new`, `/[id]`) · `/admin/customers` (+ `/new`, `/[id]`) · `/admin/vehicles` (+ `/[id]`) · `/admin/reviews` · `/admin/services` · `/admin/products` · `/admin/product-categories` · `/admin/posts` · `/admin/gallery` · `/admin/client-logos` · `/admin/pages` · `/admin/vehicle-brands` · `/admin/settings` · `/admin/users` · `/admin/audit-log` · `/admin/profile`

---

## 6. Public Pages

### 6.1 Home

| # | Section | Content |
|---|---|---|
| 1 | Hero — **"Scroll-built car"** | See §6.1.1. Ends with headline "Your Car's Care, Our Commitment", sub-line "Multi-brand car service & repair in Dhaka since 2012", buttons **Book Appointment** (primary) and **Call 01711-949110** (outline) |
| 2 | Trust strip | Since 2012 · Certified technicians · Computerized diagnosis · Authorized Shell Helix dealer (icons) |
| 3 | Services | 6–8 featured service cards (icon/image, name, short text, "Learn more"); "View all services" |
| 4 | About intro | Photo + short story, Bangla tagline as a quote, "About us" link |
| 5 | Why choose us | 4–6 reasons with icons |
| 6 | Shell Helix highlight | Dark band with product image, "Authorized dealer of Shell Helix lubricants", "View lubricants" |
| 7 | Work showcase | Gallery strip (latest 6–8 photos) → Gallery |
| 8 | Testimonials | Featured reviews carousel with stars and "Verified customer" badge; "Read all reviews" / "Write a review" |
| 9 | Client logos | Logo row (hidden if none, D12) |
| 10 | Latest blog | 3 latest posts |
| 11 | Booking CTA | Red band: "Book your service today" + full appointment form or button; Emergency and Pick & Drop buttons (call/WhatsApp, D8) |

#### 6.1.1 Hero concept: the car builds itself as you scroll

**Inspiration (owner-supplied, 2026-11-01):** two Facebook reels showing car websites where scrolling assembles a car — loose parts and a bare chassis come together into a finished, shiny car on a dark background. Used for the idea only; no assets or designs from those videos are copied.

**Jayma twist — the assembly tells the service story.** Jayma Motors repairs cars rather than selling them, so each assembly stage is labelled with the service it represents:

| Scroll stage | Visual | Caption (left side, large type) |
|---|---|---|
| 0 % | Bare chassis + floating parts on a dark stage, red rim light | "Every car tells a story. We read it." — **Computerized diagnosis** |
| 20 % | Engine and brakes drop into place | **Engine & brake servicing** |
| 40 % | Body panels attach; dents smooth out | **Denting & body repair** |
| 60 % | Paint sweeps across the body (red → deep gloss) | **Full body painting & detailing** |
| 80 % | Wheels fit and align (alignment grid lines flash) | **Wheel alignment & balancing** |
| 100 % | Finished car, headlights on, reflection on the floor | "Your Car's Care, Our Commitment" + **Book Appointment** / **Call** |

Supporting UI on the stage: JM logo top-left in the header, a thin vertical **progress rail** on the right with 6 dots (clickable — jumps to that stage), a "Scroll" cue with a down arrow at 0 %.

**How it works (technical approach — confirmed in Step 6):**

| Option | Description | Verdict |
|---|---|---|
| A. Image sequence on canvas | ~90–120 pre-rendered frames (WebP) of the assembly; scroll position picks the frame drawn on a `<canvas>` (the technique used by Apple product pages) | **Recommended** — smooth, works on all browsers, predictable performance, no 3D runtime |
| B. Real-time 3D (Three.js) | A 3D car model with separate parts animated in the browser | Not recommended — needs a licensed, part-separated 3D model, large downloads, heavy on mid-range phones |
| C. Scrubbing a video | Scroll controls video playback position | Not recommended — stutters on many mobile browsers |

**Performance & accessibility rules:**

- The section is pinned for about 3–4 screen heights of scrolling, then normal page scroll continues.
- The **final frame** loads first as a normal optimised image, so the page looks complete immediately (fast first paint, good SEO); the frame sequence loads in the background.
- Mobile: a smaller frame set (~60 frames, lower resolution); slow connections or `Save-Data` get the static final image with a short fade-in.
- `prefers-reduced-motion`: no animation — static finished car with the stage captions shown as a simple list.
- All headline text is real HTML text (not baked into images), so it is readable by search engines and screen readers.

**Assets needed [ASSET]:** the assembly frames. Options, decided before Step 8:

| Source | Notes |
|---|---|
| Hire a 3D artist to render the sequence from a licensed car model | Best quality and full rights; one-time cost |
| Licensed stock 3D animation of a car assembling, exported to frames | Cheaper; check the licence allows website use |
| AI-generated video of a car assembling, converted to frames | Cheapest; quality varies; check the tool's commercial-use terms |

A generic car (not a specific branded model) avoids trademark issues. Until the final frames exist, development uses a placeholder sequence.

### 6.2 About Us · Why Us · Terms · Privacy · Shell Helix

Editable page content (`pages` table): page hero (title + breadcrumb + optional image), rich text body, CTA band at the bottom. Shell Helix page additionally lists products in the "Shell Helix Lubricants" category.

### 6.3 Services list & detail

- **List:** page hero, grid of service cards (1 col mobile, 2 tablet, 3 desktop).
- **Detail:** hero with service name and image; description; "Book this service" (opens booking form with the service pre-selected); related services; CTA band.

### 6.4 Products list & detail (D2 showcase)

- **List:** category tabs (All · Shell Helix Lubricants · Parts), product cards (image, name, brand, price or "Call for price").
- **Detail:** image gallery, name, brand, price or "Call for price", description, specifications table, buttons **Call to order** and **WhatsApp to order** (WhatsApp message pre-filled with the product name). No cart.

### 6.5 Gallery

Album filter chips; masonry/grid of photos; click opens a lightbox (keyboard + swipe navigation, captions).

### 6.6 Blog list & post

- **List:** cards with cover, title, date, excerpt; pagination.
- **Post:** title, date, cover, body (readable width ~70 characters), share buttons (Facebook, WhatsApp, copy link), related posts.

### 6.7 Reviews

- Average rating and total count at the top.
- List of approved reviews (name, stars, date, text, "Verified customer" badge), pagination.
- **Write a review** form: name, email (optional), star rating, review text with character counter. After submit: "Thank you! Your review will appear after approval."

### 6.8 Book Appointment

Single page form, grouped into three visual steps on one screen (no multi-page wizard):

1. **Your details** — name, phone, email (optional). Logged-in: pre-filled.
2. **Your vehicle** — logged-in: choose saved vehicle or "Add new"; guest: brand (dropdown), model, registration number.
3. **Service & date** — service (dropdown), preferred date, notes.

Submit → **confirmation screen** with reference number (`APT-2026-00012`), summary, "We will call you to confirm the time", buttons: "Add another booking", "Go to Home"; logged-out users see "Create an account to track your bookings".

Errors: shown inline under each field; duplicate booking and closed day shown as a banner at the top of the form.

### 6.9 Service Enquiry

Form with all M3 fields; services as multi-select checkboxes; "How did you hear about us?" select. Success screen with reference number and the 24–48 hour response message.

### 6.10 Contact

Contact cards (address, phone, email, WhatsApp, opening hours when set), embedded Google Map, and two buttons: **Send a Service Enquiry** and **Book Appointment**. No separate contact form (U6), so every message arrives through the enquiry workflow staff already manage.

### 6.11 Error pages

404 ("Page not found" + links to Home, Services, Book Appointment) and 500 (friendly message + phone number).

---

## 7. Auth Pages

| Page | Content |
|---|---|
| Login | "Phone or email", password (show/hide), "Remember me", Login button, "Forgot password?", "Create account" |
| Register | Name, phone, email, password, confirm password, accept terms; after submit → portal with "Check your email to verify" banner |
| Forgot password | Email → "If this email is registered, you will receive a link" |
| Reset password | New password + confirm |
| Verify email | Result screen (success / expired link with "Resend") |
| Admin login | Separate, minimal: logo, email, password; no registration link; dark theme to distinguish it from customer login |

---

## 8. Customer Portal Pages

| Page | Content |
|---|---|
| Dashboard | Greeting; cards: Next appointment (with status), Vehicle currently in workshop (In Progress), Last service (date, vehicle, total); quick actions: Book appointment, Add vehicle |
| My Vehicles | Vehicle cards (brand, model, year, registration, last service date); Add / Edit (modal); Remove (blocked/archived rules from Step 3) |
| Appointments | Tabs Upcoming / Past; each row: reference, date, vehicle, service, status badge; detail page with status timeline; Cancel button (when allowed, with confirmation dialog) |
| Service History | Filter by vehicle; list: date, reference, vehicle, work summary, total, status; detail page: work lines, parts lines, subtotals, discount, grand total, customer notes, next service due; "Print" (browser print-friendly layout) |
| My Reviews | Own reviews with status; "Write a review" |
| Profile | Name, email (re-verify on change), phone (read-only, "Contact us to change"), change password |

Unverified email: Service History shows a lock state with "Verify your email to view your service history" + Resend button (C1).

---

## 9. Admin Pages

### 9.1 Dashboard

Stat cards (Today's appointments, Pending appointments, New enquiries, Vehicles in workshop, Pending reviews); "Today" list; "Needs attention" list (enquiries > 24 h, pending bookings for tomorrow); This-month numbers (Manager/Super Admin).

### 9.2 Standard list page pattern

Title + primary action (e.g. "New service record") → filters bar (search, status, date range) → table → pagination. Row click opens detail. Bulk actions not in Phase 1.

### 9.3 Key screens

| Screen | Content |
|---|---|
| Appointments list | Columns: reference, date, customer, phone, vehicle, service, status, source; quick filters: Today / Upcoming / Pending |
| Appointment detail | Contact & vehicle info, linked customer (or "Link to customer"), status actions as buttons (Confirm, Reschedule, Cancel, Check-in, No-show — only valid ones shown), time note, timeline |
| Enquiries list & detail | Fields, status actions, internal notes thread, "Convert to appointment" |
| Customers list | Name, phone, email, online account (yes/no), vehicles count, last visit; "Possible match" flag (Step 3 §4.4) |
| Customer detail | Profile, vehicles, appointments, service records, link/unlink account, deactivate |
| Vehicle detail | Info, ownership history, service history, Transfer ownership (Manager+) |
| **Service record editor** | Header (customer, vehicle, date in, odometer, complaint, technicians); **line-item table** with "Add labour" / "Add part" (part search from products or free text), quantity, unit price, line total; live totals panel (subtotals, discount, grand total — recalculated by the server on save); internal vs customer notes clearly labelled; actions: Save, Complete, Cancel (role-based); after completion fields lock with "Edit (logged)" for Manager+ |
| Reviews | Tabs Pending / Approved / Rejected; Approve, Reject, Feature toggle |
| Content editors | Services, products, posts, pages: form with title, slug, image upload, rich text, SEO panel, status (Draft/Published), Preview link |
| Gallery | Album list; multi-image upload; drag to reorder |
| Settings | Tabs: Business, Social, Appointments (window, closed weekdays, holidays calendar, daily limit), Notifications, SEO, Quick buttons |
| Users | Staff list; invite user (name, email, phone, role); deactivate |
| Audit log | Filter by user, event, date; row expands to old → new values |

---

## 10. Interaction & Feedback Rules

| Situation | Behaviour |
|---|---|
| Form submit | Button shows spinner and is disabled; double-submit prevented |
| Validation | Client checks on blur/submit for quick feedback; server errors (422) mapped to the same fields |
| Success | Toast + redirect or updated view |
| Destructive / irreversible action | Confirmation dialog stating the consequence; reason field where Step 3 requires one |
| Session expired | Redirect to login with "Your session expired" and return to the same page after login |
| Network error | Inline error with "Try again" |
| Empty lists | Empty state with a helpful action |
| Loading | Skeletons for lists/cards, spinners only inside buttons |

---

## 11. Accessibility Checklist

- Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI borders).
- Every input has a visible label; errors linked with `aria-describedby`.
- Full keyboard navigation; visible focus ring (`brand-600`, 2 px offset).
- Touch targets ≥ 44 × 44 px.
- Images have alt text (required in admin uploads).
- Status never shown by colour alone.
- Respects `prefers-reduced-motion` (no carousel autoplay, no scroll-built hero animation when set).
- Language attribute `en`; Bangla tagline marked `lang="bn"`.

---

## 12. SEO & Sharing (design side)

- One H1 per page; logical heading order.
- Every public page has its own title and description (editable for content pages).
- Open Graph image: default brand image; service/product/post images where available.
- `LocalBusiness` (AutoRepair) structured data with address, phone, opening hours (when set), rating.

---

## 13. Owner Checklist

| # | Item | Status / default |
|---|---|---|
| U1 | Logo files | **Received** (JPG). Transparent SVG/PNG + white version still wanted; otherwise redrawn as SVG in Step 8 |
| U2 | Workshop photos (10–30, high resolution) | **[ASSET]** — Facebook photos can be used temporarily |
| U3 | Brand red | `#C42927` (measured from the logo "M", 2026-11-01) |
| U8 | Home hero | **Scroll-built car** (§6.1.1), image-sequence technique; assembly frames source to be chosen before Step 8 |
| U4 | Fonts | Montserrat (headings) + Inter (body) |
| U5 | Hero headline | "Your Car's Care, Our Commitment" (English version of the tagline) |
| U6 | Contact page form | Default: no separate form; contact page links to Service Enquiry |
| U7 | Visual preview | Optional: a clickable HTML preview of colours, components and the home page before development |
