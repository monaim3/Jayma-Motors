# Jayma Motors — Step 7: Backend Architecture & API Specification (DRAFT)

| Item | Value |
|---|---|
| Status | **Approved 2026-11-01** (BE1 purifier, BE2 intervention/image, BE3 query-builder) |
| Based on | Steps 1–6 (approved) |
| Scope | Laravel structure, services, policies, events, jobs, configuration, and every Phase 1 API endpoint. Code is written in Step 8. |

---

## 1. Versions & Setup

| Item | Choice |
|---|---|
| Laravel | Latest stable at project start |
| PHP | 8.3+ (Hostinger offers up to 8.4) |
| Database driver | `mariadb` |
| Local environment | Laravel Herd or Laragon + MariaDB on Windows |
| Code style | Laravel Pint (default preset) |
| Tests | Pest |

---

## 2. Application Structure

```
backend/app/
├── Enums/                       # AppointmentStatus, EnquiryStatus, ServiceRecordStatus, ReviewStatus,
│                                #   ContentStatus, ItemType, FuelType, HeardFrom, UserStatus
├── Events/                      # AppointmentBooked, AppointmentStatusChanged, EnquirySubmitted,
│                                #   ServiceRecordCompleted, ReviewSubmitted, PublicContentChanged
├── Exceptions/                  # InvalidStatusTransition, BookingNotAllowed, VehicleAlreadyRegistered
├── Http/
│   ├── Controllers/Api/V1/
│   │   ├── Auth/                # Register, Login, StaffLogin, Logout, Me, EmailVerification, Password
│   │   ├── Public/              # Settings, Services, Products, Posts, Gallery, Pages, Reviews,
│   │   │                        #   ClientLogos, VehicleBrands, Redirects, Appointments, Enquiries
│   │   ├── Customer/            # Profile, Vehicles, Appointments, ServiceRecords, Reviews, Dashboard
│   │   └── Admin/               # Dashboard, Appointments, Enquiries, Customers, Vehicles, ServiceRecords,
│   │                            #   Reviews, Services, Products, ProductCategories, Posts, Gallery,
│   │                            #   ClientLogos, Pages, VehicleBrands, Settings, Holidays, Users,
│   │                            #   Roles, AuditLogs, Uploads, Search
│   ├── Middleware/              # EnsureCustomer, EnsureStaff, EnsureActiveUser
│   ├── Requests/<Area>/<Module>/  # One Form Request per write endpoint
│   └── Resources/<Module>/      # API Resources (public and admin variants where fields differ)
├── Jobs/                        # RevalidateFrontend, ProcessUploadedImage, BackupDatabase
├── Listeners/                   # SendAppointmentEmails, SendEnquiryEmails, SendServiceCompletedEmail,
│                                #   SendReviewAlert, QueueFrontendRevalidation
├── Mail/ or Notifications/      # One notification per email in Step 3 §12
├── Models/                      # One per business table (Step 4)
├── Policies/                    # Appointment, Vehicle, ServiceRecord, Review, Customer, User
├── Services/
│   ├── Appointments/AppointmentService.php
│   ├── Appointments/BookingRules.php
│   ├── Enquiries/EnquiryService.php
│   ├── Customers/CustomerAccountService.php
│   ├── Vehicles/VehicleService.php
│   ├── ServiceRecords/ServiceRecordService.php
│   ├── Reviews/ReviewService.php
│   ├── Content/SlugService.php
│   ├── Media/ImageUploadService.php
│   ├── Settings/SettingsService.php
│   └── Support/ReferenceNumberGenerator.php, AuditLogger.php, PhoneNumber.php, RegistrationNumber.php
└── Providers/
```

Routes: `routes/api.php` loads `routes/api/v1/{auth,public,customer,admin}.php`.

---

## 3. Core Services (business logic lives here)

| Service | Methods | Key rules (Step 3) |
|---|---|---|
| `AppointmentService` | `book()`, `confirm()`, `reschedule()`, `cancel()`, `checkIn()`, `markNoShow()`, `expirePast()` | Booking window, closed days, holidays, daily limit, duplicate check (§6.1); valid transitions only (§6.2); check-in creates a service record in the same transaction |
| `BookingRules` | `assertDateAllowed()`, `availability(from, to)` | "Today" computed in Asia/Dhaka |
| `EnquiryService` | `submit()`, `changeStatus()`, `addNote()`, `convertToAppointment()` | Conversion copies fields and links both records |
| `CustomerAccountService` | `register()`, `linkWalkInByVerifiedEmail()`, `linkManually()`, `possibleMatches()`, `deactivate()` | Auto-link only after email verification; phone matches flagged only (§4.4) |
| `VehicleService` | `addForCustomer()`, `update()`, `archiveOrDelete()`, `transfer()` | Normalised registration unique; ownership rows maintained (§5) |
| `ServiceRecordService` | `open()`, `updateHeader()`, `replaceItems()`, `recalculate()`, `complete()`, `cancel()` | Totals with BCMath; one open record per vehicle; locked after completion except `edit-completed` permission; audit old→new |
| `ReviewService` | `submit()`, `approve()`, `reject()`, `setFeatured()` | Verified-customer badge; one per 30 days per customer |
| `ReferenceNumberGenerator` | `next('APT')` | `SELECT … FOR UPDATE` on `reference_counters` inside the caller's transaction |
| `AuditLogger` | `log(event, model, old, new, note)` | Append-only |
| `SettingsService` | `get()`, `publicSettings()`, `update(group, values)` | Cached; cache cleared + revalidation event on change |
| `ImageUploadService` | `store(file, type)` | Validates, renames to UUID, resizes, converts to WebP, returns path |

**Status transitions** are defined on each status enum (`canTransitionTo()`); a disallowed change throws `InvalidStatusTransition` → HTTP **409**.

All multi-table writes run inside `DB::transaction()`.

---

## 4. Middleware, Guards & Rate Limits

| Middleware | Use |
|---|---|
| `auth:sanctum` | All customer and admin routes |
| `EnsureActiveUser` | Rejects inactive accounts (logs them out) |
| `EnsureCustomer` | `/me/*` routes — user must have `customer` role |
| `EnsureStaff` | `/admin/*` routes — user must have a staff role |
| `permission:<name>` (Spatie) | Per admin route group (Step 4 §15) |
| `verified` | Customer service-history routes only (C1) |

| Named rate limiter | Limit |
|---|---|
| `login` | 5 / minute per (login identifier + IP) |
| `register` | 5 / hour per IP |
| `password` | 3 / 10 minutes per email + IP |
| `public-forms` | 5 / 10 minutes per IP (appointments, enquiries, reviews) |
| `api` | 120 / minute per user (or IP for guests) |

---

## 5. Events, Jobs & Scheduling

| Event | Listeners (queued) |
|---|---|
| `AppointmentBooked` | Email customer (if email) + workshop alert |
| `AppointmentStatusChanged` | Email customer on confirm/reschedule/cancel; workshop alert on customer cancel |
| `EnquirySubmitted` | Email submitter (if email) + workshop alert |
| `ServiceRecordCompleted` | Email customer with history link |
| `ReviewSubmitted` | Workshop alert |
| `PublicContentChanged` | `RevalidateFrontend` job → `POST {FRONTEND_URL}/api/revalidate` with `REVALIDATE_SECRET` and affected tags |

| Scheduled task (timezone Asia/Dhaka) | When |
|---|---|
| `appointments:expire-pending` | Daily 00:30 |
| `queue:work --stop-when-empty --max-time=50` | Every minute, `withoutOverlapping()` |
| `auth:clear-resets`, session/cache pruning | Daily |
| `BackupDatabase` job (dump → off-server storage) | Weekly |

---

## 6. Configuration Highlights

| File | Setting |
|---|---|
| `.env` | `APP_TIMEZONE=UTC`, `APP_BUSINESS_TIMEZONE=Asia/Dhaka`, `DB_CONNECTION=mariadb`, `SESSION_DRIVER=database`, `QUEUE_CONNECTION=database`, `CACHE_STORE=database`, `MAIL_MAILER=smtp`, `FRONTEND_URL`, `REVALIDATE_SECRET`, `SUPER_ADMIN_EMAIL` |
| `config/cors.php` | paths `api/*`, `sanctum/csrf-cookie`; origins = frontend URL(s); credentials true |
| `config/sanctum.php` | stateful domains from env |
| `bootstrap/app.php` | `statefulApi()`, API prefix, exception rendering to JSON, throttle definitions |
| `config/filesystems.php` | `public` disk for website images; `local` (private) disk reserved for future private files |
| Password links | Reset and verification URLs point to the **frontend** (`FRONTEND_URL/reset-password`, `/verify-email`) |

---

## 7. API Conventions (from Step 1, applied)

| Item | Rule |
|---|---|
| Base | `/api/v1` |
| Format | JSON; `snake_case` keys; dates ISO 8601 UTC; money as strings `"1250.00"` |
| Single item | `{ "data": { … } }` |
| List | `{ "data": [ … ], "links": { … }, "meta": { … } }` |
| Errors | `{ "message": "…", "errors": { "field": ["…"] } }` (422) or `{ "message": "…" }` |
| Pagination | `?page=&per_page=` (default 15, max 100) |
| Filter / sort / search | `?filter[status]=pending&sort=-created_at&search=…` — allow-listed per endpoint |
| Identifiers | Admin routes use numeric `id`; customer routes use `reference` (APT/SR numbers) or own `id` checked by policy; public content uses `slug` |

**Status codes:** 200 OK · 201 Created · 204 No Content · 401 · 403 · 404 · 409 invalid state / conflict · 419 CSRF · 422 validation · 429 · 500.

Legend for the tables below — **Auth**: `—` public · `C` customer · `Cv` verified customer · `S:<perm>` staff with permission.

---

## 8. Endpoints — Authentication

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/sanctum/csrf-cookie` | — | Sets XSRF cookie |
| POST | `/auth/register` | — (throttle `register`) | `name, phone, email, password, password_confirmation, accept_terms` → 201 user; sends verification email; logs in |
| POST | `/auth/login` | — (throttle `login`) | `login` (phone or email), `password`, `remember` — customers only |
| POST | `/auth/staff/login` | — (throttle `login`) | `email, password, remember` — staff only |
| POST | `/auth/logout` | C / S | Ends session → 204 |
| GET | `/auth/me` | C / S | `{ id, name, email, phone, email_verified, type: customer|staff, roles[], permissions[] }` |
| POST | `/auth/email/verification-notification` | C | Resend verification (throttled) |
| GET | `/auth/email/verify/{id}/{hash}` | C (signed URL params) | Verifies email; triggers walk-in auto-link |
| POST | `/auth/forgot-password` | — (throttle `password`) | `email` → always 200 with generic message |
| POST | `/auth/reset-password` | — | `token, email, password, password_confirmation`; also used by new staff to set their first password |

Login with wrong credentials → 422 `{ "message": "These credentials do not match our records." }` (same message for unknown accounts).

---

## 9. Endpoints — Public

| Method | Path | Notes |
|---|---|---|
| GET | `/settings/public` | Business info, social links, quick buttons, opening hours, SEO defaults |
| GET | `/services` | Published; `filter[bookable]=1` for dropdowns; ordered |
| GET | `/services/{slug}` | Detail + related services |
| GET | `/product-categories` | Active categories |
| GET | `/products` | Published; `filter[category]=slug`, `filter[featured]=1`, paginated |
| GET | `/products/{slug}` | Detail with images and specifications; `price` null → "Call for price" |
| GET | `/posts` | Published, newest first, paginated |
| GET | `/posts/{slug}` | Detail + 3 related |
| GET | `/gallery/albums` | Published albums with cover image |
| GET | `/gallery/images` | `filter[album]=slug`, paginated |
| GET | `/pages/{key}` | `about`, `why-us`, `shell-helix`, `terms`, `privacy` |
| GET | `/client-logos` | Active, ordered |
| GET | `/vehicle-brands` | Active, ordered |
| GET | `/reviews` | Approved, paginated; `filter[featured]=1` for home |
| GET | `/reviews/summary` | `{ average_rating, total }` |
| POST | `/reviews` | throttle `public-forms`; `name, email?, rating, body`, honeypot → 201 "pending approval" |
| GET | `/appointments/availability` | `from, to` → `{ max_date, closed_dates[], full_dates[] }` |
| POST | `/appointments` | throttle `public-forms`; Step 2 M2 fields (+ `vehicle_id` when logged in) → 201 `{ reference, status, preferred_date }`; 422 closed/out-of-window date; 409 duplicate booking |
| POST | `/enquiries` | throttle `public-forms`; Step 2 M3 fields, `service_ids[]` → 201 `{ reference }` |
| GET | `/redirects` | `path` → `{ new_path }` or 404 |

---

## 10. Endpoints — Customer (`/me`, auth `C`)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/me/dashboard` | C | Next appointment, in-progress vehicle, last completed service (last one only when verified) |
| GET | `/me/profile` | C | |
| PATCH | `/me/profile` | C | `name, email` (email change → re-verification) |
| PUT | `/me/password` | C | `current_password, password, password_confirmation` |
| GET | `/me/vehicles` | C | Non-archived |
| POST | `/me/vehicles` | C | 409 `VehicleAlreadyRegistered` with message from Step 3 §5 |
| PATCH | `/me/vehicles/{id}` | C (policy: owner) | Registration change re-checks uniqueness |
| DELETE | `/me/vehicles/{id}` | C (owner) | Deletes if no history, else archives → 204 |
| GET | `/me/appointments` | C | `filter[scope]=upcoming|past` |
| GET | `/me/appointments/{reference}` | C (owner) | Includes status timeline |
| POST | `/me/appointments/{reference}/cancel` | C (owner) | Allowed for pending/confirmed before the date; else 409 |
| GET | `/me/service-records` | **Cv** | `filter[vehicle_id]`; only records within the customer's ownership periods; excludes cancelled |
| GET | `/me/service-records/{reference}` | **Cv** (policy) | Lines, totals, customer notes, next service; never internal notes |
| GET | `/me/reviews` | C | Own reviews with status |

Unverified customer calling `/me/service-records*` → **403** `{ "message": "Please verify your email to view your service history." }` (frontend shows the lock state).

---

## 11. Endpoints — Admin (`/admin`, staff only)

### 11.1 Dashboard & search

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/admin/dashboard` | `dashboard.view` | Widgets per Step 3 §15; monthly numbers only for Manager+ |
| GET | `/admin/search` | `dashboard.view` | `q` → customers (name/phone), vehicles (registration), references (APT/ENQ/SR) |

### 11.2 Appointments — `appointments.manage`

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/appointments` | Filters: `status`, `date_from`, `date_to`, `source`, `search` (reference, name, phone, registration); sort `preferred_date`, `created_at` |
| POST | `/admin/appointments` | Staff booking; may set `status=confirmed` directly |
| GET | `/admin/appointments/{id}` | Includes linked customer/vehicle and audit timeline |
| PATCH | `/admin/appointments/{id}` | `time_note`, `notes`, `customer_id`, `vehicle_id` (linking) |
| POST | `/admin/appointments/{id}/confirm` | `time_note?` |
| POST | `/admin/appointments/{id}/reschedule` | `preferred_date`, `reason` |
| POST | `/admin/appointments/{id}/cancel` | `reason` (required) |
| POST | `/admin/appointments/{id}/check-in` | Requires linked customer + vehicle (creates them from the snapshot if missing, after staff confirmation in UI) → 201 `{ service_record_id }` |
| POST | `/admin/appointments/{id}/no-show` | Only on/after the date |

### 11.3 Enquiries — `enquiries.manage`

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/enquiries` | Filters: `status`, dates, `search`; `filter[stale]=1` → New older than 24 h |
| GET | `/admin/enquiries/{id}` | With notes and services |
| POST | `/admin/enquiries/{id}/status` | `status: contacted|closed` |
| POST | `/admin/enquiries/{id}/notes` | `note` → 201 |
| POST | `/admin/enquiries/{id}/convert` | `preferred_date, service_id?` → 201 `{ appointment_id }` |

### 11.4 Customers — `customers.manage`

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/customers` | Filters: `has_account`, `possible_match`, `search` (name, phone, email) |
| POST | `/admin/customers` | Walk-in: `name, phone, email?, address?, notes?` |
| GET | `/admin/customers/{id}` | Profile, account status, vehicles, recent appointments and service records |
| PATCH | `/admin/customers/{id}` | Includes phone change (C2) — also updates the linked user's phone, uniqueness enforced |
| GET | `/admin/customers/{id}/possible-matches` | Other customer records/accounts sharing the phone |
| POST | `/admin/customers/{id}/link-account` | `user_id` — merges an online account with this walk-in record (records moved in a transaction, audited) |
| POST | `/admin/customers/{id}/deactivate` · `/activate` | Account login on/off; records kept |

### 11.5 Vehicles — `vehicles.manage` (transfer: `vehicles.transfer`)

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/vehicles` | Filters: `brand`, `search` (registration, chassis, customer) |
| POST | `/admin/vehicles` | `customer_id` + vehicle fields; 409 if registration exists |
| GET | `/admin/vehicles/{id}` | Ownership history + service history |
| PATCH | `/admin/vehicles/{id}` | |
| POST | `/admin/vehicles/{id}/transfer` | `customer_id`, `note?` — requires `vehicles.transfer` |

### 11.6 Service records — `service-records.manage`

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/admin/service-records` | manage | Filters: `status`, `vehicle_id`, `customer_id`, dates, `search` |
| POST | `/admin/service-records` | manage | `customer_id, vehicle_id, date_in, odometer_km?, complaint?, technician_names?` → 201; 409 if vehicle already has an open record |
| GET | `/admin/service-records/{id}` | manage | Full record incl. internal notes and audit trail |
| PATCH | `/admin/service-records/{id}` | manage (open) / `edit-completed` (completed) | Header fields, notes, discount, next service |
| PUT | `/admin/service-records/{id}/items` | manage (open) / `edit-completed` (completed) | Replaces all lines: `items[]: { type, service_id?, product_id?, description, quantity, unit_price, sort_order }`; server recalculates totals → returns updated record |
| POST | `/admin/service-records/{id}/complete` | manage | Needs ≥ 1 item; `date_out?` (default now) → fires `ServiceRecordCompleted` |
| POST | `/admin/service-records/{id}/cancel` | `service-records.cancel` | `reason` required |

Validation: `discount` ≤ subtotal; `quantity` > 0 (2 decimals); `unit_price` ≥ 0; max 100 lines.

### 11.7 Reviews — `reviews.moderate`

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/reviews` | `filter[status]` |
| POST | `/admin/reviews/{id}/approve` · `/reject` | |
| PATCH | `/admin/reviews/{id}/featured` | `is_featured` (approved only) |

### 11.8 Content — `content.manage`

Standard resource endpoints (`GET` list, `POST`, `GET {id}`, `PATCH {id}`, `DELETE {id}`) plus `POST …/reorder` (`ids[]` in display order) where ordering applies:

| Resource | Path | Extras |
|---|---|---|
| Services | `/admin/services` | reorder; delete blocked (409) when referenced → unpublish instead |
| Product categories | `/admin/product-categories` | reorder; delete blocked when it has products |
| Products | `/admin/products` | reorder; `images[]` managed via `/admin/products/{id}/images` (POST, DELETE, reorder) |
| Posts | `/admin/posts` | `publish` sets `published_at` |
| Gallery albums | `/admin/gallery/albums` | reorder |
| Gallery images | `/admin/gallery/images` | bulk upload (`files[]`, `album_id?`), reorder |
| Client logos | `/admin/client-logos` | reorder |
| Pages | `/admin/pages` | `GET` list, `GET {id}`, `PATCH {id}` only (no create/delete) |
| Vehicle brands | `/admin/vehicle-brands` | reorder; delete blocked when used → deactivate |

Slug changes on published items create `slug_redirects` automatically (C9). Every write fires `PublicContentChanged`.

| Method | Path | Notes |
|---|---|---|
| POST | `/admin/uploads` | `file`, `type: service|product|post|gallery|logo|page|brand` → 201 `{ path, url, width, height }`. JPG/PNG/WebP, ≤ 5 MB |

### 11.9 Settings — `settings.manage`

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/settings` | All groups |
| PATCH | `/admin/settings/{group}` | Validated per group (Step 3 §11) |
| GET / POST / DELETE | `/admin/holidays` | `date, name`; date unique |

### 11.10 Users, roles, audit — Super Admin

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/admin/users` | `users.manage` | Staff only |
| POST | `/admin/users` | `users.manage` | `name, email, phone?, role` → sends set-password email |
| PATCH | `/admin/users/{id}` | `users.manage` | Name, phone, role; last active Super Admin cannot be demoted (409) |
| POST | `/admin/users/{id}/deactivate` · `/activate` | `users.manage` | Last active Super Admin cannot be deactivated (409) |
| GET | `/admin/roles` | `users.manage` | Roles with their permissions (read-only in Phase 1) |
| GET | `/admin/audit-logs` | `audit-logs.view` | Filters: `user_id`, `event`, `auditable_type`, `auditable_id`, dates |

### 11.11 Staff own profile

| Method | Path | Notes |
|---|---|---|
| PATCH | `/admin/profile` | Name, phone |
| PUT | `/admin/profile/password` | Current + new password |

---

## 12. Example Payloads

**POST `/api/v1/appointments`**

```json
{
  "contact_name": "Rahim Uddin",
  "contact_phone": "01711949110",
  "contact_email": "rahim@example.com",
  "vehicle_brand_id": 1,
  "vehicle_brand": "Toyota",
  "vehicle_model": "Axio",
  "registration_number": "Dhaka Metro Ga 12-3456",
  "service_id": 3,
  "preferred_date": "2026-11-10",
  "notes": "Brake noise when stopping",
  "website": ""
}
```

`201 Created`

```json
{ "data": { "reference": "APT-2026-00012", "status": "pending", "preferred_date": "2026-11-10" } }
```

`409 Conflict`

```json
{ "message": "You already have a booking for this date." }
```

**GET `/api/v1/me/service-records/SR-2026-00045`**

```json
{
  "data": {
    "reference": "SR-2026-00045",
    "status": "completed",
    "vehicle": { "id": 7, "brand_name": "Toyota", "model": "Axio", "registration_number": "Dhaka Metro Ga 12-3456" },
    "date_in": "2026-11-10T04:15:00Z",
    "date_out": "2026-11-10T11:40:00Z",
    "odometer_km": 84250,
    "complaint": "Brake noise when stopping",
    "items": [
      { "type": "labour", "description": "Brake pad replacement (front)", "quantity": "1.00", "unit_price": "1500.00", "line_total": "1500.00" },
      { "type": "part", "description": "Front brake pads (Japanese reconditioned)", "quantity": "1.00", "unit_price": "3200.00", "line_total": "3200.00" },
      { "type": "part", "description": "Shell Helix HX7 10W-40", "quantity": "4.00", "unit_price": "950.00", "line_total": "3800.00" }
    ],
    "labour_subtotal": "1500.00",
    "parts_subtotal": "7000.00",
    "discount": "500.00",
    "grand_total": "8000.00",
    "customer_notes": "Brake fluid checked, OK.",
    "next_service_date": "2027-02-10",
    "next_service_km": 89250
  }
}
```

---

## 13. Validation Summary (Form Requests)

| Field | Rule |
|---|---|
| Phone | Normalised by `PhoneNumber`; regex `^\+8801[3-9]\d{8}$` after normalisation |
| Email | `email:rfc`, lower-cased, max 191 |
| Password | `Password::min(8)->letters()->numbers()`; checked against breached-password list in production (`uncompromised()`) |
| Registration number | 3–40 chars; normalised copy unique where required |
| Year / release year | 1950 – current year + 1 |
| Preferred date | `date`, Asia/Dhaka today ≤ date ≤ today + window; not closed/holiday/full |
| Money | `decimal:0,2`, min 0, max 9,999,999,999.99 |
| Rich text | Sanitised to an allow-list of tags before saving |
| Images | `image`, `mimes:jpg,jpeg,png,webp`, `max:5120` KB, dimensions ≤ 6000 px |
| Honeypot | Hidden `website` field must be empty on public forms |

---

## 14. Authorization Summary (Policies)

| Policy | Rule |
|---|---|
| `VehiclePolicy` | Customer: own, non-archived vehicles only. Staff: `vehicles.manage` |
| `AppointmentPolicy` | Customer: own appointments; cancel only when status and date allow. Staff: `appointments.manage` |
| `ServiceRecordPolicy` | Customer: verified email + record date within their ownership period + status not cancelled. Staff: manage; editing completed requires `service-records.edit-completed`; cancel requires `service-records.cancel` |
| `ReviewPolicy` | Staff with `reviews.moderate` |
| `CustomerPolicy` | Staff with `customers.manage` |
| `UserPolicy` | Super Admin; last-Super-Admin protection |

Customer routes return **404** (not 403) for other people's records, so references cannot be probed.

---

## 15. Packages

### 15.1 Approved in Step 1

`laravel/framework`, `laravel/sanctum`, `spatie/laravel-permission`; dev: `laravel/pint`, `pestphp/pest`.

### 15.2 Proposed additions (each needs approval)

| Package | Why it is needed | Alternative considered |
|---|---|---|
| `mews/purifier` (HTML Purifier) | Sanitise rich text from Tiptap (blog, pages, descriptions) — blocks XSS | `strip_tags` — not safe for attributes/links |
| `intervention/image` | Resize uploads and convert to WebP (fast pages, smaller storage) | Raw GD code — more code, more bugs |
| `spatie/laravel-query-builder` | Safe, allow-listed filter/sort/include parsing for ~20 admin lists | Hand-written filters per controller — repetitive and error-prone |

### 15.3 Deliberately not used

Laravel Breeze/Fortify UI scaffolding (custom API endpoints instead), repository pattern packages, Redis, Horizon, Telescope in production, activity-log packages (own `audit_logs` table is enough).

---

## 16. Testing Plan (executed in Step 9)

| Type | Coverage |
|---|---|
| Feature tests (Pest) | Every endpoint: success, validation (422), auth (401), permission (403/404), state conflicts (409) |
| Unit tests | `PhoneNumber`, `RegistrationNumber`, `BookingRules`, totals calculation, status transitions, `ReferenceNumberGenerator` |
| Critical scenarios | Walk-in linking only after verified email; customer cannot see records outside ownership; one open service record per vehicle; last Super Admin protection; concurrent bookings get unique references |
| API collection | Bruno requests for every endpoint in `api-collection/` |

---

## 17. Implementation Order (backend half of Step 6 §15)

| # | Milestone | Backend scope |
|---|---|---|
| B0 | Foundation | Project, config, CORS/Sanctum, base migrations, enums, error rendering, rate limiters, Pint/Pest, seeders (roles, super admin, brands) |
| B1 | Authentication | Register, login (customer/staff), logout, me, verification, password reset |
| B2 | Settings & content basics | Settings, holidays, pages, services, uploads, revalidation |
| B3 | Appointments | Public booking + availability, customer endpoints, admin endpoints, emails |
| B4 | Customers & vehicles | Admin + customer endpoints, ownerships, linking |
| B5 | Service records | Admin editor endpoints, customer history, totals, audit |
| B6 | Enquiries | Public + admin + convert |
| B7 | Reviews | Public + admin moderation |
| B8 | Products, blog, gallery, client logos, vehicle brands | Public + admin |
| B9 | — | (Home page uses existing endpoints) |
| B10 | Dashboard, search, users, roles, audit log | |
| B11 | Hardening | Scheduled tasks, backup job, final rate limits, security headers |

---

## 18. Decisions Requested

| # | Item | Proposed |
|---|---|---|
| BE1 | Add `mews/purifier` (rich text sanitising) | Yes |
| BE2 | Add `intervention/image` (resize + WebP) | Yes |
| BE3 | Add `spatie/laravel-query-builder` (admin list filters/sorting) | Yes |
