# Jayma Motors — Step 3: Business Logic & Workflows (DRAFT)

| Item | Value |
|---|---|
| Status | **Approved 2026-11-01** (C1–C5, C7–C9 accepted as defaults; C6 deferred) |
| Based on | [01-technical-architecture.md](01-technical-architecture.md), [02-business-requirements.md](02-business-requirements.md) (both approved) |
| Scope | Rules, status flows, permissions and notifications for Phase 1. No database schema (Step 4), no UI (Step 5). |

Rules marked **[CONFIRM]** are reasonable defaults that the owner should check. Everything else follows directly from Steps 1–2.

---

## 1. Actors

| Actor | Description |
|---|---|
| Guest | Anyone visiting the website without logging in |
| Customer | Registered user with the `customer` role |
| Service Advisor | Front-desk staff (D7) |
| Manager | Operations and content (D7) |
| Super Admin | Owner; full access (D7) |
| System | Scheduled tasks and queued jobs |

Management users (Service Advisor, Manager, Super Admin) are called **staff** below.

---

## 2. Permissions Matrix

✅ allowed · ◐ own records only · — not allowed

| Action | Guest | Customer | Service Advisor | Manager | Super Admin |
|---|---|---|---|---|---|
| View public pages | ✅ | ✅ | ✅ | ✅ | ✅ |
| Book appointment | ✅ | ✅ | ✅ (on behalf of customer) | ✅ | ✅ |
| Submit enquiry | ✅ | ✅ | — | — | — |
| Submit review | ✅ | ✅ | — | — | — |
| View / manage own vehicles | — | ◐ | — | — | — |
| View own appointments, cancel | — | ◐ | — | — | — |
| View own service history | — | ◐ | — | — | — |
| Manage appointments | — | — | ✅ | ✅ | ✅ |
| Manage enquiries | — | — | ✅ | ✅ | ✅ |
| Manage customers & vehicles | — | — | ✅ | ✅ | ✅ |
| Create / edit open service records | — | — | ✅ | ✅ | ✅ |
| Edit completed service records | — | — | — | ✅ | ✅ |
| Cancel service records | — | — | — | ✅ | ✅ |
| Moderate reviews | — | — | — | ✅ | ✅ |
| Manage content (services, blog, gallery, products, client logos, pages) | — | — | — | ✅ | ✅ |
| Manage site settings | — | — | — | ✅ | ✅ |
| View dashboard | — | — | ✅ | ✅ | ✅ |
| Manage staff users & roles | — | — | — | — | ✅ |
| View audit log | — | — | — | — | ✅ |

Every rule above is enforced by Laravel (permission middleware + policies). The frontend only hides what the user cannot do.

Permissions are stored as Spatie permissions (e.g. `appointments.manage`, `service-records.edit-completed`) and assigned to roles, so the Super Admin can adjust a role later without code changes.

---

## 3. Data Rules (apply everywhere)

| Rule | Detail |
|---|---|
| Phone numbers | Bangladeshi mobile numbers accepted as `01XXXXXXXXX`, `+8801XXXXXXXXX` or `8801XXXXXXXXX`; stored in one normalised form (`+8801XXXXXXXXX`); must match `01[3-9]` + 8 digits |
| Email | Lower-cased and trimmed before saving |
| Vehicle registration number | Stored as entered for display, plus a normalised copy (upper-case, spaces/dashes removed) used for duplicate checks and search |
| Money | BDT, `DECIMAL(12,2)`; all totals calculated by the server |
| Dates & times | Stored in UTC, shown in Asia/Dhaka |
| Reference numbers | Human-readable, unique, never reused: `APT-YYYY-NNNNN` (appointments), `ENQ-YYYY-NNNNN` (enquiries), `SR-YYYY-NNNNN` (service records) |
| Deleting | Business records (customers, vehicles, appointments, enquiries, service records) are never hard-deleted; they are cancelled, closed or soft-deleted |
| Spam protection on public forms | Rate limit per IP, hidden honeypot field; CAPTCHA added only if spam appears |

---

## 4. Customer Accounts

### 4.1 Registration

1. Customer enters **name, phone, email, password** (Step 2, M9).
2. Validation: phone valid and **not already used**; email valid and **not already used**; password at least 8 characters.
3. Account created with role `customer`, status `active`.
4. Verification email sent (link valid 60 minutes).
5. Customer is logged in immediately.

**Unverified customers** can log in and book appointments, but **cannot see service history** until their email is verified. **[CONFIRM]**
Reason: there is no SMS verification, so a verified email is the only proof that the person owns the account before showing private service data.

### 4.2 Login

- One field accepts **phone or email** (contains `@` → email, otherwise phone) + password.
- Failed attempts: max 5 per minute per identifier+IP; then a 1-minute wait.
- Error message never reveals whether the phone/email exists.
- Inactive (blocked) accounts cannot log in.

### 4.3 Password reset

- Request by email address → reset link valid 60 minutes → new password → all other sessions logged out.
- Same response whether or not the email exists.
- Phone-based reset is not available (no SMS in Phase 1, D9).

### 4.4 Walk-in customers and linking accounts

Staff can create a **customer record without an online account** (walk-in customer: name, phone, email optional).

When someone registers online with a phone or email that matches an existing walk-in record:

| Situation | Result |
|---|---|
| Email matches the walk-in record's email | After the customer **verifies the email**, the account is linked automatically and the history becomes visible |
| Only phone matches | **Not linked automatically** (the phone cannot be verified). Staff see a "possible match" flag and link it manually after confirming with the customer |

This prevents a stranger from registering with someone else's phone number and seeing their service history.

### 4.5 Customer profile

- Customer can change name, email (requires re-verification) and password (requires current password).
- Phone change: done by staff only. **[CONFIRM]** (Reason: phone is a login identifier and cannot be verified by SMS.)
- Staff can deactivate a customer account; records are kept.

---

## 5. Vehicles

| Rule | Detail |
|---|---|
| Owner | Each vehicle belongs to one customer |
| Fields | Brand, model, year, registration number (required); colour, VIN/chassis number, fuel type (optional) |
| Uniqueness | Normalised registration number is unique across the system |
| Customer adds a vehicle already in the system | Blocked with message "This vehicle is already registered. Please contact Jayma Motors." |
| Ownership transfer | Staff only; service history stays with the vehicle; the new owner sees records from the transfer date onward **[CONFIRM]** |
| Remove | Customer can remove a vehicle with no service records; vehicles with history are archived (hidden), not deleted |

---

## 6. Appointment Workflow

### 6.1 Booking rules

| Rule | Value |
|---|---|
| Who can book | Guests, customers, staff on behalf of a customer |
| Fields | As M2: name, phone, email (optional), preferred date, brand, model, registration number, service, notes |
| Date | Today or later, up to **60 days** ahead **[CONFIRM]** |
| Closed days | Configurable in Settings (e.g. weekly holiday, public holidays); booking on a closed day is rejected |
| Daily limit | Optional setting; when set, a full day cannot be selected. Default: no limit **[CONFIRM]** |
| Time | Date only (as reference); staff confirm the exact time by phone/email |
| Logged-in customer | Form pre-filled; can choose a saved vehicle; a new vehicle is saved to their account |
| Guest | Contact and vehicle details stored on the appointment; staff can link it to a customer record later |
| Duplicates | Same phone + same date + same registration number while an earlier booking is still Pending/Confirmed → rejected with "You already have a booking for this date" |

### 6.2 Status flow

```
            ┌───────────── cancel (customer or staff) ─────────────┐
            │                                                      ▼
 [Pending] ──confirm──► [Confirmed] ──check-in──► [Checked-in] ─► (service record created)
     │                     │   │
     │                     │   └──no-show (staff, after the date)──► [No-show]
     │                     └──reschedule (staff) → stays Confirmed, new date
     └──reject (staff)───────────────────────────────────────────► [Cancelled]
```

| From | Action | To | Who | Notes |
|---|---|---|---|---|
| — | Book | Pending | Guest / Customer / Staff | Staff bookings may go straight to Confirmed |
| Pending | Confirm | Confirmed | Staff | Staff can set a time note (e.g. "10:30 AM") |
| Pending / Confirmed | Reschedule | same status, new date | Staff | Reason recorded |
| Pending / Confirmed | Cancel | Cancelled | Customer (own, before the appointment date) or Staff | Reason required for staff |
| Confirmed | Check-in | Checked-in | Staff | Opens a new service record pre-filled with customer + vehicle |
| Confirmed | Mark no-show | No-show | Staff | Only on or after the appointment date |

- Pending bookings whose date has passed are automatically marked **Expired** each night by the system.
- Every status change records who did it and when.

---

## 7. Enquiry Workflow

```
[New] ──► [Contacted] ──► [Closed]
   └──────────────► [Converted] (staff creates an appointment from it)
```

| Rule | Detail |
|---|---|
| Fields | As M3 |
| Confirmation shown | "We will respond within 24–48 hours via email, WhatsApp or phone." |
| Staff actions | Add internal notes, change status, convert to appointment (fields copied) |
| Reminder | Enquiries still **New** after 24 hours appear highlighted on the dashboard |

---

## 8. Service Record Workflow (core, D1)

A service record is one visit of one vehicle to the workshop.

### 8.1 Creation

- From a checked-in appointment (pre-filled), or
- Directly by staff for a walk-in (select or create customer + vehicle).

### 8.2 Contents

| Section | Fields |
|---|---|
| Header | Reference no., customer, vehicle, date in, odometer reading (km), customer complaint |
| Work lines | Description (e.g. "Engine oil change"), linked service (optional), labour charge |
| Parts lines | Part/lubricant name, quantity, unit price |
| Totals | Parts subtotal, labour subtotal, discount (amount), **grand total** — all calculated by the server |
| Notes | Technician notes (internal), notes for customer (visible) |
| Completion | Date out, next service due (date and/or km) — optional |

Technicians are recorded as names in the record, not as system users. **[CONFIRM]**

### 8.3 Status flow

```
[In Progress] ──complete──► [Completed] ──(Manager edit, logged)──► [Completed]
      │
      └──cancel (Manager/Super Admin, reason required)──► [Cancelled]
```

| Rule | Detail |
|---|---|
| Edit while In Progress | Service Advisor, Manager, Super Admin |
| Complete | Requires at least one work or parts line; sets date out |
| Edit after Completed | Manager / Super Admin only; every change kept in the audit log with old and new values |
| Cancel | Manager / Super Admin only; reason required; record stays visible to staff, hidden from customer |
| One open record per vehicle | A vehicle cannot have two In Progress records at the same time |

### 8.4 What the customer sees

| Status | Customer view |
|---|---|
| In Progress | "Your vehicle is being serviced", date in, complaint |
| Completed | Full record: work done, parts used, amounts, grand total, notes for customer, next service due |
| Cancelled | Not shown |

Internal technician notes are never shown to customers.

Amounts are shown as **service cost information, not an invoice**. Invoices and payments come later (D3, D4).

---

## 9. Reviews

```
[Pending] ──approve──► [Approved] ──feature──► shown on home page
    └──────reject────► [Rejected]
```

| Rule | Detail |
|---|---|
| Who can submit | Guests and customers |
| Fields | Name, rating 1–5 stars, review text (20–1000 characters); email optional for guests |
| Logged-in customer | Name pre-filled; review shows a **"Verified customer"** badge if they have at least one completed service record |
| Moderation | Every review starts Pending; only Approved reviews are public |
| Featured | Manager marks approved reviews as Featured → shown in home page testimonials |
| Limit | One review per customer account per 30 days; guests rate-limited by IP |
| Edit | Staff cannot change a review's text or rating; they only approve, reject or feature it |

---

## 10. Content Management

Applies to: services, blog posts, gallery, products (Shell Helix lubricants & parts), client logos, static pages (About, Why Us, Terms, Privacy).

| Rule | Detail |
|---|---|
| Status | Draft or Published; only Published is public |
| URL slug | Generated from the title, unique, editable; changing a slug of a published item keeps the old URL redirecting **[CONFIRM]** |
| SEO | Meta title and description per item; fall back to title/excerpt |
| Ordering | Manual display order for services, products, gallery, client logos |
| Images | JPG, PNG or WebP; max 5 MB; resized and converted on upload; alt text required for accessibility |
| Deleting | Soft delete; a service linked to appointments or service records can only be deactivated |
| Products | Name, category, images, description, specifications, optional price; when price is empty the site shows **"Call for price"**; buttons: Call, WhatsApp |
| Client logos | Section hidden on the home page when there are none (D12) |

---

## 11. Site Settings (Manager / Super Admin)

| Group | Settings |
|---|---|
| Business | Name, address, phones, email, WhatsApp number, Google Maps link, opening hours |
| Social | Facebook, Instagram, YouTube, LinkedIn links (empty ones hidden) |
| Appointments | Booking window (days), closed weekdays, holiday dates, optional daily limit |
| Notifications | Workshop email address(es) that receive new booking/enquiry/review alerts |
| SEO | Default meta title, description, share image |
| Quick buttons | Phone/WhatsApp targets for "Emergency Service" and "Pick & Drop" (D8) |

---

## 12. Notifications (email only, D9)

All emails are sent through queued jobs (Step 1, ADR-11).

| Event | Customer / submitter | Workshop email |
|---|---|---|
| Registration | Welcome + verify email | — |
| Password reset requested | Reset link | — |
| Appointment booked | "Request received" (if email given) | New booking alert |
| Appointment confirmed / rescheduled / cancelled by staff | Status email | — |
| Appointment cancelled by customer | Confirmation | Cancellation alert |
| Enquiry submitted | "We received your enquiry" (if email given) | New enquiry alert |
| Service record completed | "Your vehicle service is complete" + link to history | — |
| Review submitted | — | New review awaiting approval |
| Staff account created | Set-password link | — |

---

## 13. Staff Accounts

- Created only by Super Admin: name, email, phone, role.
- New staff receive a **set-password link** (no passwords sent by email).
- Staff log in on the separate management login page with email + password.
- Super Admin can deactivate staff; their past actions remain in records and audit log.
- At least one active Super Admin must always exist (the last one cannot be deactivated or demoted).

---

## 14. Audit Log

Recorded automatically (who, when, what, old → new values):

- Appointment status changes
- Service record creation, completion, edits after completion, cancellation
- Customer account linking and vehicle ownership transfers
- Staff user and role changes
- Site settings changes

Visible to Super Admin only. Kept indefinitely.

---

## 15. Dashboard (staff)

| Widget | Content |
|---|---|
| Today | Appointments for today (Confirmed / Checked-in) |
| Waiting | Pending appointments, New enquiries (> 24 h highlighted), Pending reviews |
| Workshop | Vehicles currently In Progress |
| This month | Appointments booked, services completed, new customers |

Service Advisors see operational widgets; Managers and Super Admin see all.

---

## 16. Scheduled Tasks (System)

| Task | When |
|---|---|
| Mark past Pending appointments as Expired | Daily, 00:30 Asia/Dhaka |
| Process queued emails | Every minute (cron, Step 1) |
| Database backup to off-server storage | Weekly |
| Prune expired password-reset tokens and old sessions | Daily |

---

## 17. Owner Confirmations

| # | Rule | Decision |
|---|---|---|
| C1 | Unverified customers cannot see service history | Yes (default accepted) |
| C2 | Only staff can change a customer's phone number | Yes (default accepted) |
| C3 | New vehicle owner sees history only from transfer date | Yes (default accepted) |
| C4 | Booking window | 60 days ahead (default accepted; adjustable in Settings) |
| C5 | Daily booking limit | None (default accepted; adjustable in Settings) |
| C6 | Weekly closed day(s) and opening hours | **Deferred — owner will provide later.** No code impact: these are values in Site Settings (§11) entered by the admin. Until set, all days are bookable. |
| C7 | Technicians recorded as names, not system users | Yes (default accepted) |
| C8 | Customers see costs in their service history | Yes (default accepted) |
| C9 | Old URLs redirect when a slug changes | Yes (default accepted) |

Items marked **[CONFIRM]** in sections 4–10 follow the decisions above.
