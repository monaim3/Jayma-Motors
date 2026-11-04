# Jayma Motors — Step 2: Business Requirements & Modules (DRAFT)

| Item | Value |
|---|---|
| Status | **Approved 2026-11-01** (decisions D1–D12) |
| Based on | Owner statement "requirements almost same as reference site", the Jayma Motors Facebook page, and the public pages of the reference site |
| Reference site | https://biswasautomobilesbd.com (public pages only; its customer and admin areas are behind login and were not visible) |
| Previous step | [01-technical-architecture.md](01-technical-architecture.md) (approved) |

### Source tags

| Tag | Meaning |
|---|---|
| **[REF]** | Seen on the reference site |
| **[FB]** | Taken from the Jayma Motors Facebook page |
| **[PROPOSED]** | Not visible anywhere; suggested because the feature needs it. **Needs owner confirmation.** |

Nothing tagged [PROPOSED] is built unless the owner confirms it.

---

## 1. Business Profile [FB]

| Item | Value |
|---|---|
| Name | Jayma Motors |
| Type | Multi-brand car service & repair workshop ("One-stop Vehicle Solution") |
| Since | 2012 |
| Also | Importer of vehicle parts; authorized dealer of SHELL HELIX lubricants (Ranks Petroleum Limited) |
| Address | 441-442, Evercare Hospital Road (beside Khanas/Khudos), Vatara, Dhaka, Bangladesh |
| Phone | 01711-949110 |
| Email | jaymamotors@gmail.com |
| Website | jaymamotors.com |
| Tagline | "আপনার গাড়ির যত্ন, আমাদের অঙ্গীকার — জায়মা মোটরস, যেখানে বিশ্বস্ততা মেলে দক্ষতায়!" |

### Services [FB]

- Engine & brake servicing
- Diagnosis & repair
- Computerized diagnosis
- Full body painting & detailing
- Denting
- Routine maintenance by certified technicians
- Wheel alignment
- Battery replacement
- Japanese reconditioned parts

The reference site additionally lists: oil change & tune-up, transmission/gearbox, accident repair, windshield replacement, car wash & polish, wheel balancing, hybrid servicing, ceramic coating, pick & drop **[REF]**. The owner decides which of these Jayma Motors also offers.

---

## 2. User Types

| User | How they get an account | Login page |
|---|---|---|
| Visitor | None | — |
| Customer | Self-registration **[REF]** | `/login` |
| Management (admin & staff) | Created by an administrator | Separate management login **[REF]** |

### Management roles (decision D7)

| Role | Purpose |
|---|---|
| Super Admin | Full access, manages management users and roles |
| Manager | Day-to-day operations, content, bookings, customers |
| Service Advisor | Handles appointments, enquiries, customers, vehicles, service records |

Detailed permissions per role are defined in Step 3.

---

## 3. Module List

| # | Module | Area | Source |
|---|---|---|---|
| M1 | Public website & content pages | Public | [REF] |
| M2 | Appointment booking | Public + Admin | [REF] |
| M3 | Service enquiry | Public + Admin | [REF] |
| M4 | Reviews & testimonials | Public + Admin | [REF] |
| M5 | Blog / news | Public + Admin | [REF] |
| M6 | Gallery | Public + Admin | [REF] |
| M7 | Services catalogue | Public + Admin | [REF] [FB] |
| M8 | Payment page (EMI / online payment) | Public | [REF] |
| M9 | Customer authentication | Public | [REF] |
| M10 | Customer portal | Customer | [REF] partially ("service history") |
| M11 | Management authentication | Admin | [REF] |
| M12 | Admin dashboard & management | Admin | [PROPOSED] (not visible on reference) |
| M13 | Shell Helix lubricants & parts showcase | Public + Admin | [FB] — Jayma-specific |
| M14 | Site settings (contact info, social links, SEO) | Admin | [PROPOSED] |

---

## 4. Module Details

### M1 — Public website [REF]

| Page | Content |
|---|---|
| Home | Hero, appointment form, company intro (since 2012), services, work showcase, latest blog posts, testimonials, client/partner logos, second appointment form |
| About Us | Company story, experience, team/facility |
| Why Us | Reasons to choose Jayma Motors |
| Services | All services; each with its own detail page |
| Gallery | Workshop and work photos |
| Special service page | The reference has a sub-brand page ("Biswas Auto Shine"). Jayma equivalent to be decided (see M13 and Q11) |
| Blogs | List + detail pages |
| Reviews | Customer reviews + "Post a review" |
| Contact Us | Address, phone, email, map, contact form |
| Service Enquiry | Enquiry form (M3) |
| Payment | EMI / payment page (M8) — **later, decision D3** |
| Terms & Conditions, Privacy Policy | Static legal pages |
| Sitemap | `sitemap.xml` for SEO |

Site-wide elements [REF]: header navigation, footer with contact info and social links (Facebook, Instagram, YouTube, LinkedIn, WhatsApp, Google Maps), quick buttons "Book Appointment", "Service Enquiry", "Need Emergency Service?", "Write a Review".

### M2 — Appointment booking [REF]

**Form fields**

| Field | Required |
|---|---|
| Name | Yes |
| Phone | Yes |
| Email | No |
| Preferred date | Yes |
| Car brand | Yes |
| Car model | Yes |
| Registration number | Yes |
| Service (dropdown) | Yes |
| Notes | No |

- Works without login **[REF]**. If the customer is logged in, their details and saved vehicles pre-fill the form **[PROPOSED]**.
- Admin views, confirms, reschedules, cancels, completes appointments **[PROPOSED]**.
- Status flow: New → Confirmed → Completed / Cancelled **[PROPOSED]** (detailed in Step 3).
- Customer and admin are notified of new/changed appointments **[PROPOSED]** (channel: Q8).

### M3 — Service enquiry [REF]

| Field | Required |
|---|---|
| Name | Yes |
| Phone | Yes |
| Email | No |
| Address | No |
| Car brand | Yes |
| Car model | Yes |
| Release year | Yes |
| Car number | Yes |
| Services | No |
| How did you hear about us? | No |
| Comment | Yes |

- Confirmation message: team responds within 24–48 hours via email, WhatsApp or phone **[REF]**.
- Admin sees enquiries, marks them as New / Contacted / Closed **[PROPOSED]**.

### M4 — Reviews & testimonials [REF]

- Public page listing reviews with customer name and text.
- "Post a review" form.
- Selected reviews shown on the home page as testimonials.
- Admin approves before a review is published **[PROPOSED]** — prevents spam.
- Star rating **[PROPOSED]** (not confirmed on reference).

### M5 — Blog [REF]

- Admin creates, edits, publishes posts (title, cover image, content, SEO fields).
- Public list and detail pages; latest posts on home page.

### M6 — Gallery [REF]

- Admin uploads photos (optionally grouped into albums/categories **[PROPOSED]**).
- Public gallery page.

### M7 — Services catalogue [REF] [FB]

- Admin manages services: name, short description, full description, image, display order, active/inactive.
- Same list feeds the public Services page, the home page, and the appointment/enquiry dropdowns.

### M8 — Payment page [REF]

Reference behaviour: a "Service Your Car with EMI Plan" page with a QR code / link to an **SSLCommerz** invoice. Payment is not integrated with customer accounts.

**Decision D3: deferred.** No payment page or online payment in Phase 1. The owner will decide later between:

| Option | Description | Effort |
|---|---|---|
| A | Same as reference: info page + QR/link to SSLCommerz (or bKash/Nagad) payment link generated outside the system | Low |
| B | Integrated online payment: customer pays an invoice from the portal through SSLCommerz; payment recorded automatically | Medium–High; needs a merchant account |

The architecture keeps room for either option; nothing in Phase 1 blocks it.

### M9 — Customer authentication [REF]

- Register: Name, Phone, Email, Password **[REF]**.
- Login with **phone or email** + password **[REF]**.
- Forgot password **[REF]**.
- Email verification and/or phone OTP **[PROPOSED]** (OTP needs an SMS gateway — Q8).

### M10 — Customer portal

Only "customers can access their vehicle's service history" is stated on the reference **[REF]**. Proposed portal contents **[PROPOSED]**:

| Section | Content |
|---|---|
| Dashboard | Upcoming appointment, recent service, quick "Book appointment" |
| My Vehicles | Add/edit vehicles (brand, model, year, registration number) |
| My Appointments | List, status, book new, cancel (rules in Step 3) |
| Service History | Past service records per vehicle (date, work done, parts, amount) |
| Invoices / Payments | **Later** (decisions D3, D4) — not in Phase 1 |
| My Reviews | Reviews the customer has posted |
| Profile | Name, phone, email, password change |

### M11 — Management authentication [REF]

- Separate login page for management.
- No public registration; accounts created by Super Admin.
- Stricter rate limiting **[PROPOSED]**.

### M12 — Admin dashboard [PROPOSED]

| Section | Purpose |
|---|---|
| Dashboard | Today's appointments, new enquiries, pending reviews, quick stats |
| Appointments | Manage bookings (M2) |
| Enquiries | Manage enquiries (M3) |
| Customers | List, view, add/edit customers (including walk-in customers without online accounts) |
| Vehicles | Customer vehicles |
| Service Records | Record work done on each visit (work done, parts used, cost) — **the data behind "service history"** — **confirmed, decision D1** |
| Services | M7 |
| Blog, Gallery, Reviews | M4–M6 |
| Clients / Partners | Logos shown on home page |
| Lubricants & Parts | M13 |
| Users & Roles | Management users and permissions |
| Settings | M14 |

### M13 — Shell Helix lubricants & parts [FB]

Jayma-specific. **Decision D2: Option A — showcase only.**

- Admin manages products: name, category (e.g. Shell Helix lubricant, parts), image, description, specifications, display order, active/inactive.
- Public product list and detail pages.
- "Call to order" and "WhatsApp to order" buttons; no cart, no online checkout, no stock tracking.
- Price display: shown or "Call for price" per product **[PROPOSED]**.

### M14 — Site settings [PROPOSED]

Admin edits business info (address, phones, email, opening hours, social links, map), home page banners, and default SEO metadata without code changes.

---

## 5. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Devices | Fully responsive; most visitors are expected on mobile |
| SEO | Server-rendered public pages, per-page metadata, sitemap, Google Maps/Business link |
| Language | **English only (decision D5)** |
| Currency | BDT |
| Time zone | Asia/Dhaka |
| Performance | Optimised images; public pages cached |
| Security | As defined in Step 1 |

---

## 6. Owner Decisions

| # | Decision | Date |
|---|---|---|
| D1 | **Service records: yes.** Staff record each visit (work done, parts used, cost); customers see real service history in the portal. | 2026-11-01 |
| D2 | **Lubricants & parts: showcase only** (Option A) with call/WhatsApp to order. | 2026-11-01 |
| D3 | **Payment: deferred.** No payment page or online payment in Phase 1; decided later. | 2026-11-01 |
| D4 | **Invoices: later.** Not in Phase 1. | 2026-11-01 |
| D5 | **Language: English only.** | 2026-11-01 |
| D6 | **Services list:** Facebook list (engine & brake servicing, diagnosis & repair, computerized diagnosis, body painting & detailing, denting, routine maintenance, wheel alignment, battery replacement, Japanese reconditioned parts) + oil change, wheel balancing, car wash. Admin can edit the list any time. | 2026-11-01 (default) |
| D7 | **Management roles:** Super Admin (owner, full access), Manager (operations + content), Service Advisor (appointments, enquiries, customers, vehicles, service records). | 2026-11-01 (default) |
| D8 | **Pick & drop and Emergency service:** shown as buttons that call or WhatsApp the workshop; no booking logic. No service packages/memberships. | 2026-11-01 (default) |
| D9 | **Notifications: email only** in Phase 1. SMS later. | 2026-11-01 (default) |
| D10 | **No extra changes** from the reference site beyond the decisions above. | 2026-11-01 (default) |
| D11 | **Special highlighted page: "Shell Helix Lubricants".** | 2026-11-01 (default) |
| D12 | **Client logos section** on the home page, managed by admin; hidden when empty. | 2026-11-01 (default) |

D6–D12 were the suggested defaults, accepted when the owner asked to finish Step 2. Any of them can be changed before development.

## 7. Phasing

| Phase | Scope |
|---|---|
| **Phase 1 (launch)** | M1–M7, M9, M10 (vehicles, appointments, service history, profile), M11, M12 (including service records), M13 showcase, M14 |
| **Later (owner to decide)** | Payment (M8), invoices, SMS notifications, any further features |

---

## 8. Open Questions

None. All questions answered: Q1 → D6, Q2 → D1, Q3 → D2, Q4 → D4, Q5 → D3, Q6 → D7, Q7 → D8, Q8 → D9, Q9 → D5, Q10 → D10, Q11 → D11, Q12 → D12.

Remaining **[PROPOSED]** details inside the modules (status flows, review approval, star ratings, price display) are worked out in Step 3.
