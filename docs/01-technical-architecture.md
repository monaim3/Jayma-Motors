# Jayma Motors — Step 1: Technology Stack & Technical Architecture

| Item | Value |
|---|---|
| Project | Jayma Motors — Automobile Business Management Website |
| Domain | `jaymamotors.com` (registered at GoDaddy) |
| Hosting | Hostinger **Unlimited** web hosting plan (shared, includes Node.js apps) |
| Stack | Next.js (JavaScript) + Laravel REST API + MySQL |
| Status | Step 1 — **approved 2026-11-01** |
| Scope | Technology and architecture only. No business requirements, schema or UI. |

Items marked **[Verify]** must be confirmed against the live Hostinger hPanel before relying on them.

---

## 1. Final Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | **Next.js** (App Router), latest stable | JavaScript only (no TypeScript) |
| UI library | React (version bundled with Next.js) | Server Components by default |
| Styling | Tailwind CSS | Utility-first, design tokens in config/CSS |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) | Client-side UX validation only |
| Client state | Redux Toolkit — **only if genuinely needed** | Not installed until a real need appears |
| HTTP client | Axios (browser) + native `fetch` (Server Components) | Centralised in a service layer |
| Icons | Lucide React | |
| Backend framework | **Laravel**, latest stable | PHP 8.3+ |
| API auth | Laravel Sanctum (SPA cookie mode) | No tokens in localStorage |
| Roles & permissions | Spatie Laravel Permission | |
| ORM | Eloquent | |
| Database | **MySQL** (or MariaDB, MySQL-compatible — see §9) | Single primary database |
| Hosting | Hostinger Unlimited plan | Node.js app + PHP site + MySQL in one plan |
| Tooling | VS Code, Git, GitHub, pnpm, Composer, Bruno (or Postman) | |

---

## 2. Why Each Technology Was Selected

### 2.1 Next.js (frontend)

- **SSR / SSG / ISR** — public pages (home, services, vehicle listings) render on the server, so search engines and social previews see full HTML.
- **App Router** — nested layouts let the public site, customer portal and admin dashboard each have their own shell while sharing components.
- **Server Components** — less JavaScript sent to the browser; data for public pages is fetched on the server.
- **Built-in** routing, image optimisation (`next/image`), metadata API, loading/error boundaries.
- One application serves both the SEO-sensitive public site and the authenticated dashboards.

**Compared with alternatives**

| Alternative | Why not primary |
|---|---|
| React + Vite | Client-side rendering only. Public pages would need extra tooling for SEO; no file routing, no server rendering, no image optimisation out of the box. |
| Laravel Blade | Good for server-rendered pages, but rich dashboard interactivity would need Livewire/Alpine or a bolted-on SPA. Mixing concerns in one app makes the frontend harder to evolve independently. |
| Nuxt / SvelteKit / Remix | Capable, but the team's chosen ecosystem is React; Next.js has the largest React ecosystem and Hostinger documents Next.js hosting explicitly. |

**Architectural rule:** Next.js renders, routes and handles UI interaction. **Laravel owns all business logic and data.** Next.js Route Handlers and Server Actions are **not** used to re-implement backend logic. The only acceptable server-side Next.js code is rendering, forwarding the user's cookies to Laravel, and thin glue (e.g. `revalidate` hooks).

### 2.2 Laravel (backend)

- Mature, well-documented PHP framework with a large ecosystem.
- Built-in authentication scaffolding, password hashing, password reset, email verification.
- Eloquent ORM, migrations, seeders, factories.
- Form Request validation, middleware, policies/gates.
- Queues, scheduler, notifications, mail.
- Security defaults: CSRF, bound parameters, encrypted cookies, mass-assignment protection.
- **Runs on ordinary PHP hosting**, which is what Hostinger shared plans provide.

| Alternative | Why not |
|---|---|
| Django | Strong framework, but needs a Python runtime (WSGI/ASGI) that Hostinger shared hosting does not support as a first-class app type. |
| Node.js / Express | Minimal framework: auth, validation, ORM, queues, roles all assembled from separate packages. More decisions, more maintenance, less structure. |
| NestJS | Well-structured, but TypeScript-centric, heavier, and would occupy the Node.js slot already used by Next.js on shared hosting. |
| Go (Gin) | Fast, but compiled binaries need a VPS; small ecosystem for admin/business-app features; slower development for CRUD-heavy work. |

### 2.3 MySQL (database)

- Relational data with foreign keys and transactions — automobile business data (customers, vehicles, bookings, payments) is inherently relational.
- `DECIMAL` type for exact money values.
- Indexing, unique constraints, referential integrity.
- First-class Eloquent support.
- **Included and managed on every Hostinger plan.**

| Alternative | Why not |
|---|---|
| MongoDB | Document store. No native foreign keys; multi-document transactions are weaker in practice; financial and relational integrity become application responsibilities. Not offered on Hostinger shared hosting. |
| PostgreSQL | Technically excellent, but **not available on Hostinger shared hosting**. Would require a VPS or external managed DB, adding cost and latency for no requirement-driven benefit. |

---

## 3. System Architecture

```
                 Customers · Staff · Administrators
                               │
                        HTTPS (browser)
                               │
          ┌────────────────────┴─────────────────────┐
          │                                          │
          ▼                                          │  XHR/fetch with cookies
┌──────────────────────────────┐                     │  (credentials: include,
│  NEXT.JS FRONTEND            │                     │   X-XSRF-TOKEN header)
│  https://jaymamotors.com     │                     │
│  Hostinger Node.js app       │                     │
│                              │                     │
│  • Public site (SSR/ISR)     │                     │
│  • Customer portal           │                     │
│  • Admin / Staff dashboard   │                     │
│  • Route guard (cookie check)│                     │
└──────────────┬───────────────┘                     │
               │ Server-side fetch                   │
               │ (forwards user's cookie)            │
               ▼                                     ▼
┌──────────────────────────────────────────────────────────────┐
│  LARAVEL REST API          https://api.jaymamotors.com/api/v1 │
│  Hostinger PHP site (document root → backend/public)         │
│                                                              │
│  Routes → Middleware (auth:sanctum, throttle, role)          │
│        → Form Request (validation)                           │
│        → Controller (thin)                                   │
│        → Policy (authorization)                              │
│        → Service (business logic, DB transactions)           │
│        → Model (Eloquent)                                    │
│        → API Resource (JSON response)                        │
│                                                              │
│  Async: Jobs · Events/Listeners · Notifications · Mail       │
│  Scheduler: cron → php artisan schedule:run (every minute)   │
└──────────────┬───────────────────────────────┬───────────────┘
               │ localhost                     │ SMTP
               ▼                               ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│  MYSQL / MariaDB             │   │  Hostinger Email          │
│  Hostinger managed database  │   │  noreply@jaymamotors.com  │
└──────────────────────────────┘   └──────────────────────────┘

DNS: GoDaddy (registrar) → nameservers point to Hostinger
SSL: Free certificates from hPanel on both hostnames
```

### Layer responsibilities

| Layer | Responsible for | Never responsible for |
|---|---|---|
| Browser | Display, user input | Holding secrets or tokens in JS-readable storage |
| Next.js | Rendering, routing, layouts, SEO metadata, UI state, client-side form validation for UX, calling the API | Business rules, prices, permissions, persistence |
| Laravel | Authentication, authorization, validation, business rules, calculations, transactions, notifications, file storage | Rendering HTML pages for users |
| MySQL | Durable storage, constraints, referential integrity | Business logic (no stored procedures/triggers for business rules) |

---

## 4. Next.js Frontend Architecture

### 4.1 Route organisation (App Router route groups)

Route groups `(name)` separate layouts without affecting URLs.

| Group | Purpose | Rendering |
|---|---|---|
| `(public)` | Marketing / company pages | Server Components, SSG/ISR where possible |
| `(auth)` | Login, register, forgot/reset password, verify email | Mostly Client Components (forms) |
| `(customer)` | Customer portal | Dynamic; protected |
| `(admin)` | Admin dashboard | Dynamic; protected; role-gated |
| `(staff)` | Staff dashboard — **only if Step 2 requires it** | Dynamic; protected |

Exact routes are defined after Step 2.

### 4.2 Rules

1. **Server Components by default.** Add `"use client"` only for state, effects, event handlers, browser APIs, or React Hook Form.
2. Keep Client Components small and push them to the leaves of the tree.
3. **JavaScript only.** `jsconfig.json` provides the `@/` import alias.
4. **Tailwind CSS** for all styling; no extra CSS frameworks.
5. Reusable components live in `components/`, never inside `app/` route folders (except route-private components in `_components/`).
6. **All API calls go through `services/`** — no raw `fetch`/`axios` calls scattered in components.
7. **No global state by default.** Use, in order: server data → URL search params → local component state → React Context → Redux Toolkit (last resort, e.g. a complex multi-step booking cart).
8. **No business-critical logic in the frontend.** Totals, discounts, availability and permissions shown in the UI are always computed and re-validated by Laravel.
9. **No secrets in the frontend.** Only `NEXT_PUBLIC_*` variables reach the browser, and they hold non-secret values (e.g. the API base URL).

### 4.3 Data fetching

| Context | Method |
|---|---|
| Public pages | Server Component calls public Laravel endpoints with native `fetch` and Next.js caching (`revalidate`) |
| Authenticated pages needing SSR | Server Component reads the incoming cookies (`next/headers`) and forwards `Cookie` + `Referer`/`Origin` to Laravel |
| Interactive dashboard actions | Client Component calls the Axios instance (`withCredentials: true`, `withXSRFToken: true`) |
| Mutations | Always go to Laravel; afterwards refresh via `router.refresh()` or refetch |

### 4.4 Cross-cutting concerns

| Concern | Approach |
|---|---|
| SEO | `metadata` / `generateMetadata` per page, `sitemap.js`, `robots.js`, Open Graph images, canonical URLs |
| Loading | `loading.js` per route segment; skeleton components |
| Errors | `error.js` per segment, `global-error.js`, `not-found.js`; API errors normalised by the service layer |
| Forms | React Hook Form + Zod schema; server-side 422 errors mapped back onto form fields |
| Auth state | Current user fetched from `GET /api/v1/auth/me`; provided via a small React Context in protected layouts |
| Route protection | Next.js middleware/proxy file performs a **fast, non-authoritative** check (session cookie present → continue, otherwise redirect to login). Real authorization is always enforced by Laravel. |
| Responsive | Mobile-first Tailwind breakpoints; dashboard sidebar collapses to a drawer |
| Images | `next/image` with `remotePatterns` allowing `api.jaymamotors.com` |

### 4.5 Secure communication with Laravel

- HTTPS only in production.
- Browser → Laravel directly at `api.jaymamotors.com` with cookies (`HttpOnly`, `Secure`, `SameSite=Lax`, domain `.jaymamotors.com`).
- CSRF: the frontend first calls `GET /sanctum/csrf-cookie`; Axios automatically sends the `XSRF-TOKEN` cookie value back as the `X-XSRF-TOKEN` header.
- CORS on Laravel allows only `https://jaymamotors.com` (and `https://www.jaymamotors.com` if used) with credentials.

---

## 5. Laravel Backend Architecture

### 5.1 Style: modular monolith, lightweight

One Laravel application. Code is grouped **by business module inside Laravel's standard folders** (e.g. `Controllers/Api/V1/Booking/`, `Services/Booking/`). No module packages, no microservices, no repository layer over Eloquent unless a real need appears.

### 5.2 Responsibilities

| Component | Responsibility |
|---|---|
| **Routes** (`routes/api.php` → `routes/api/v1/*.php`) | Map versioned URLs to controllers; attach middleware groups |
| **Middleware** | Authentication (`auth:sanctum`), rate limiting (`throttle`), role/permission checks, verified email, security headers |
| **Form Requests** | Input validation + `authorize()` for simple checks; return 422 automatically |
| **Controllers** | Thin: receive validated input → call policy/service → return Resource. No business rules. |
| **Policies** | Per-model authorization (`view`, `update`, `cancel`, …); combined with Spatie permissions |
| **Services** | Business operations, especially multi-step ones; own `DB::transaction()` boundaries |
| **Models** | Eloquent: relationships, casts (money, enums, dates), scopes, `$fillable` |
| **Enums** | PHP backed enums for statuses and types |
| **API Resources** | Shape every JSON response; hide internal fields |
| **Jobs** | Slow or retryable work (emails, PDFs, reports) on the `database` queue |
| **Events / Listeners** | Decouple side-effects (e.g. "booking confirmed" → notify customer, notify staff) |
| **Notifications** | Mail (and later SMS) messages to users |
| **Exceptions** | Central rendering in `bootstrap/app.php` → consistent JSON errors |

### 5.3 Rules

- Controllers stay thin; anything reused or multi-step goes into a Service.
- Simple CRUD may call Eloquent directly from the controller — no Service for its own sake.
- Operations that must succeed or fail together use `DB::transaction()`.
- Every endpoint has an explicit authorization rule (middleware, policy, or both).
- Mass assignment is restricted with `$fillable`.
- No business logic in migrations, views, or the database.

---

## 6. API Architecture

### 6.1 Base URL and versioning

```
https://api.jaymamotors.com/api/v1/...
```

A new version (`v2`) is introduced only for breaking changes; `v1` stays until the frontend is migrated.

### 6.2 Endpoint naming

- Plural, lowercase, kebab-case nouns: `/vehicles`, `/service-bookings`.
- Nesting at most one level: `/customers/{id}/vehicles`.
- State-changing actions that are not plain CRUD use a sub-resource verb: `POST /bookings/{id}/cancel`.
- Role-scoped areas use a prefix when behaviour differs: `/api/v1/admin/...`, `/api/v1/me/...` (current user's own data).

*(Illustrative names only — real resources come from Step 2.)*

### 6.3 HTTP methods

| Method | Use |
|---|---|
| GET | Read (list or single) |
| POST | Create, or trigger an action |
| PUT / PATCH | Full / partial update (PATCH preferred) |
| DELETE | Delete (soft delete where justified) |

### 6.4 Status codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No content (e.g. logout, delete) |
| 401 | Not authenticated |
| 403 | Authenticated but not allowed |
| 404 | Not found (also used to hide resources the user may not see) |
| 409 | Conflict (e.g. double booking, state already changed) |
| 419 | CSRF token mismatch / expired |
| 422 | Validation failed |
| 429 | Too many requests |
| 500 | Server error (no internal details in production) |

### 6.5 Response format

Keep Laravel's native shapes — consistent and no custom wrapper code.

**Single resource**
```json
{ "data": { "id": 12, "name": "..." } }
```

**Paginated list**
```json
{
  "data": [ ... ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "per_page": 15, "total": 120, "last_page": 8 }
}
```

**Error**
```json
{ "message": "The given data was invalid.", "errors": { "email": ["The email field is required."] } }
```

Conventions: `snake_case` keys; dates in ISO 8601 (UTC); money as **strings** (e.g. `"1250.00"`) to avoid float rounding in JavaScript.

### 6.6 Query conventions

| Feature | Convention |
|---|---|
| Pagination | `?page=2&per_page=15` (server caps `per_page`, e.g. 100) |
| Filtering | `?filter[status]=active&filter[brand]=toyota` |
| Sorting | `?sort=-created_at,name` (`-` = descending; allow-listed fields only) |
| Search | `?search=corolla` |
| Includes | `?include=customer,vehicle` (allow-listed relations only) |

Implemented manually or with `spatie/laravel-query-builder` — decided in Step 7.

### 6.7 Authentication and authorization on the API

- Public endpoints: explicitly listed, read-only where possible, rate-limited.
- Everything else: `auth:sanctum`.
- Role/permission middleware on route groups + Policies per resource.
- Frontend visibility (hiding buttons) is cosmetic only; the API always re-checks.

---

## 7. Authentication & Security Architecture

### 7.1 Sanctum mode: **SPA cookie authentication (stateful)**

Chosen because both apps live on the same registrable domain (`jaymamotors.com` and `api.jaymamotors.com`).

**Login flow**
1. `GET https://api.jaymamotors.com/sanctum/csrf-cookie` → sets `XSRF-TOKEN` cookie.
2. `POST /api/v1/auth/login` with `X-XSRF-TOKEN` header → Laravel starts a session.
3. Session cookie (`HttpOnly`, `Secure`, `SameSite=Lax`, domain `.jaymamotors.com`) is sent on every later request.
4. `POST /api/v1/auth/logout` invalidates the session and regenerates the CSRF token.

**Key configuration**
```
SESSION_DRIVER=database
SESSION_DOMAIN=.jaymamotors.com
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=jaymamotors.com,www.jaymamotors.com
FRONTEND_URL=https://jaymamotors.com
```
CORS: `paths` include `api/*` and `sanctum/csrf-cookie`; `allowed_origins` = frontend URL(s) only; `supports_credentials=true`.

Sanctum **API tokens** are reserved for a possible future mobile app; they are not used by the website.

### 7.2 User types

One `users` table; user type expressed through **Spatie roles** (e.g. `customer`, `staff`, `admin`, `super-admin`) and fine-grained permissions. Final roles and permissions are defined in Step 2/3.

| Concern | Requirement |
|---|---|
| Customer auth | Self-registration, email verification, login, password reset |
| Admin / staff auth | Accounts created by an administrator (no public sign-up); stricter rate limits; optional 2FA later |
| Session management | Database sessions; session ID regenerated on login; idle timeout configurable; logout invalidates server session |
| Password hashing | Laravel default (bcrypt/argon2id via `Hash`); strong password rules (`Password::defaults()`) |
| Password reset | Laravel password broker; email link points to `https://jaymamotors.com/reset-password?token=...` |
| Email verification | Signed, expiring URL; verified-only routes guarded with `verified` middleware |

### 7.3 Security controls

| Threat / need | Control |
|---|---|
| Brute force | `throttle` on login (e.g. 5/min per email+IP), password reset, registration; general API limit per user/IP |
| CSRF | Sanctum CSRF cookie + `X-XSRF-TOKEN` header; `SameSite=Lax` cookies |
| CORS | Strict origin allow-list, credentials enabled only for the frontend |
| XSS | React escapes output by default; no `dangerouslySetInnerHTML` with user content; any rich text sanitised server-side; tokens never in JS-readable storage; security headers (CSP planned in Step 9) |
| SQL injection | Eloquent / query builder bindings only; no raw SQL with user input; sort/filter fields allow-listed |
| Mass assignment | `$fillable` on every model; validated data only (`$request->validated()`) |
| Authorization bypass | Policies + permission middleware on every protected route; IDs never trusted without ownership check |
| File uploads | Validate MIME type and size; rename to random UUID; store outside web root (`storage/app/private`) for sensitive files, served through an authorized controller; public images via `storage/app/public` + `storage:link`; never execute uploaded files |
| Transport | HTTPS everywhere; HSTS; HTTP → HTTPS redirect |
| Secrets | `.env` files never committed; `APP_DEBUG=false` and `APP_ENV=production` in production; Laravel code outside `public_html`; only `backend/public` is web-accessible |
| Security headers | `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/`frame-ancestors`, HSTS — set in `next.config` and Laravel middleware |
| Error leakage | Generic 500 messages in production; details only in logs |

---

## 8. Database Architecture Principles

*(Full schema is Step 4.)*

| Topic | Standard |
|---|---|
| Engine | InnoDB; `utf8mb4` / `utf8mb4_unicode_ci` |
| Primary keys | `BIGINT UNSIGNED` auto-increment (`$table->id()`). Public-facing references (e.g. booking numbers) are separate unique columns, decided in Step 4. |
| Foreign keys | Always declared (`foreignId()->constrained()`), with explicit `onDelete` behaviour (`restrict` by default for business records) |
| Unique constraints | On natural keys (email, phone, registration/VIN numbers, reference numbers) |
| Indexes | On foreign keys, frequently filtered/sorted columns, and composite indexes for common query patterns |
| Migrations | All schema changes through migrations; never edit production schema by hand; never edit a migration that has run in production — add a new one |
| Seeders | Roles, permissions, initial super-admin, lookup data; separate demo/fake data seeders for local only |
| Column types | Appropriate sizes; `ENUM`-like values stored as strings backed by PHP enums; `TIMESTAMP`/`DATETIME` stored in **UTC** |
| **Money** | **`DECIMAL(12,2)`** (or larger if required) — **never `FLOAT`/`DOUBLE`**. Cast with Laravel `decimal:2`; calculations in PHP use string-safe math (`bcmath`) where precision matters. |
| Soft deletes | Only where history or recovery matters (e.g. customers, vehicles); never as a substitute for proper status fields; financial records are never hard-deleted |
| Transactions | Required for any multi-table write that must be atomic (bookings + payments, stock changes) |
| Audit | `created_by` / `updated_by` and/or an activity log where accountability is required (Step 3/4) |
| Time zone | DB and app in UTC; displayed in Asia/Dhaka *(assumed — confirm in Step 2)* |

### Backup & recovery

1. Hostinger **daily automatic backups** (included in the Unlimited plan) — files + database.
2. Scheduled Laravel task dumping the database to an **off-server** location (e.g. cloud storage) weekly — protects against account-level loss.
3. Restore procedure documented and tested once before launch (Step 10).

---

## 9. Hostinger Deployment Architecture

### 9.1 Plan comparison (Hostinger "Websites" plans, 48-month term, prices seen 2026-10-31)

| | Premium (~$2.49/mo) | **Unlimited (~$3.49/mo)** | Cloud Startup (~$7.99/mo) |
|---|---|---|---|
| Node.js apps (Next.js SSR) | ❌ Not included | ✅ | ✅ |
| PHP (Laravel) | ✅ | ✅ | ✅ |
| MySQL | ✅ | ✅ | ✅ |
| Storage | 20 GB SSD | 50 GB NVMe | 100 GB NVMe |
| Backups | Weekly | Daily | Daily + on-demand |
| CDN | ✅ | ✅ | ✅ |
| Email | 2 mailboxes/site | Unlimited mailboxes (1 yr) | Unlimited mailboxes (1 yr) |
| Resources | Shared | Shared | Higher, dedicated |
| Persistent background workers | ❌ | ❌ | ❌ |
| **Fit** | **Cannot run the architecture** | **Selected** | Upgrade path |

Renewal prices are higher than introductory prices; confirm on the checkout page.

**VPS (future option):** full root access — Nginx, PHP-FPM, Node.js with PM2, MySQL, Supervisor queue workers, Redis, websockets. Needed only for realtime features, long-running workers, or heavy traffic. Requires server administration skills.

### 9.2 Constraints on shared/Unlimited hosting and how we handle them

| Constraint | Handling |
|---|---|
| No persistent queue worker | Queue driver `database`; cron runs `php artisan schedule:run` every minute; scheduler runs `queue:work --stop-when-empty --max-time=50` with `withoutOverlapping()` |
| No Redis | `database` driver for queue, cache and sessions |
| No websockets | No realtime features at launch; polling where needed; VPS if realtime becomes a requirement |
| Shared CPU/RAM | Cache public pages (ISR), paginate all lists, index queries, offload work to queued jobs |
| Database is **MariaDB** (confirmed) | `DB_CONNECTION=mariadb`; use MariaDB locally too; avoid MySQL-8-only features |

### 9.3 Requirements to verify with Hostinger **before purchase (Step 10)** **[Verify]**

Development happens entirely on localhost (Steps 1–9). These checks are done before buying the plan, ahead of deployment.

**Confirmed from Hostinger documentation (checked 2026-11-01):**

- ✅ **Monorepo supported.** Build Settings → *Root directory* accepts a subdirectory containing `package.json`; only that subdirectory is built. We set it to `frontend`.
- ✅ **Next.js runs in server mode** (standalone output, ISR supported); framework auto-detected.
- ✅ **Node.js versions:** 18, 20, 22, 24 (20 and 22 LTS).
- ✅ **Deployment:** GitHub/GitLab with automatic build on push, or archive upload.
- ✅ **Unlimited (Business) plan limits:** 5 Node.js websites, process limit 120, entry processes 60.
- ✅ **Build limits:** install and build steps 15 minutes each; one build at a time.
- ⚠️ **Request timeout:** a single request to a Node.js site is stopped after 120 seconds.
- ⚠️ **Cold start:** apps stop after a period without traffic and restart on the next request, so the first visit after idle time is slower.

- ✅ **Node.js + PHP on one plan:** Node.js apps are added as their own website; PHP sites are separate websites on the same plan. A subdomain is created as its own website. So `jaymamotors.com` (Node.js) + `api.jaymamotors.com` (PHP/Laravel) is supported.
- ✅ **Plan resources (Unlimited):** 2 CPU cores, 3 GB RAM, 600,000 inodes, 60 PHP workers, PHP memory limit 2,048 MB, 150 databases, 3 GB per database. Treat CPU/RAM as shared by everything on the account (Next.js + Laravel + builds).
- ✅ **PHP:** versions up to 8.4, switchable per website/subdomain in hPanel; most extensions enabled by default (only security-sensitive ones such as `dl()` are off).
- ✅ **SSH + Composer:** available on the Unlimited/Business plan (hPanel → Advanced → SSH Access).
- ✅ **Database: MariaDB** (Hostinger uses MariaDB on all Web and Cloud plans). Laravel uses `DB_CONNECTION=mariadb`.

**Quick checks in hPanel after purchase (not blockers):**

1. Exact MariaDB version.
2. Laravel extensions are enabled for the chosen PHP version: `bcmath`, `ctype`, `fileinfo`, `mbstring`, `openssl`, `pdo_mysql`, `tokenizer`, `xml`, `curl`, `gd` or `imagick`, `zip`, `intl`.

---

## 10. Recommended Hosting Configuration

### 10.1 Domain & DNS

- Keep GoDaddy as **registrar** (no transfer needed).
- Point GoDaddy **nameservers** to Hostinger (values shown in hPanel when the domain is added) so DNS, SSL and email are managed in one place.

> **Warning:** Changing nameservers replaces all existing DNS records at GoDaddy. If `jaymamotors.com` already has email or other services, record their DNS entries first and recreate them in Hostinger.

### 10.2 Hostnames

| Hostname | Serves | Hostinger setup |
|---|---|---|
| `jaymamotors.com` | Next.js frontend | Node.js web app |
| `www.jaymamotors.com` | 301 redirect → `jaymamotors.com` | DNS + redirect |
| `api.jaymamotors.com` | Laravel API | Subdomain; document root = `backend/public`; rest of Laravel outside the web root |
| Database | MySQL | Created in hPanel; dedicated DB user with access to this DB only; connects via `localhost` |
| Email | `info@`, `noreply@jaymamotors.com` | Hostinger mailboxes; Laravel sends via Hostinger SMTP (TLS) |

### 10.3 Production settings

- SSL enabled on both hostnames; force HTTPS.
- Laravel: `APP_ENV=production`, `APP_DEBUG=false`, `php artisan config:cache route:cache view:cache` on deploy.
- Cron (hPanel): `* * * * * php /path/to/backend/artisan schedule:run >> /dev/null 2>&1`.
- Next.js environment variables set in the hPanel Node.js app settings, not in the repository.
- Upgrade path: Unlimited → Cloud Startup (hPanel upgrade, no code change) → VPS (redeploy, no code change).

### 10.4 Environments

| Environment | Frontend | Backend |
|---|---|---|
| Local | `http://localhost:3000` | `http://localhost:8000` (Sanctum stateful domain `localhost:3000`, `SESSION_DOMAIN=localhost`) |
| Production | `https://jaymamotors.com` | `https://api.jaymamotors.com` |

A staging subdomain (e.g. `staging.jaymamotors.com`) can be added later if plan resources allow.

---

## 11. High-Level Project Structure

One Git repository, two independent applications.

```
jayma-motors/
├── docs/                         # Architecture, requirements, decisions (this file)
├── api-collection/               # Bruno API requests (versioned with the code)
│
├── frontend/                     # Next.js application
│   ├── app/
│   │   ├── (public)/             # Company website pages
│   │   ├── (auth)/               # Login, register, password reset, verification
│   │   ├── (customer)/           # Customer portal
│   │   ├── (admin)/              # Admin dashboard
│   │   ├── (staff)/              # Staff dashboard (only if required)
│   │   ├── layout.js             # Root layout
│   │   ├── not-found.js
│   │   ├── error.js / global-error.js
│   │   ├── sitemap.js / robots.js
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   # Buttons, inputs, modals, tables (generic)
│   │   ├── layout/               # Header, footer, sidebar, navigation
│   │   ├── forms/                # Shared form building blocks
│   │   └── features/             # Feature-specific components, grouped by module
│   ├── services/                 # One file per API module (auth, vehicles, ...)
│   ├── lib/
│   │   ├── api-client.js         # Axios instance (browser)
│   │   ├── server-fetch.js       # fetch wrapper for Server Components (cookie forwarding)
│   │   ├── utils.js
│   │   └── constants.js
│   ├── schemas/                  # Zod schemas
│   ├── hooks/                    # Custom React hooks
│   ├── context/                  # Small React contexts (e.g. auth user)
│   ├── store/                    # Redux Toolkit — created only when needed
│   ├── public/                   # Static assets
│   ├── middleware.js / proxy.js  # Fast route guard (cookie presence)
│   ├── next.config.mjs
│   ├── jsconfig.json             # @/ alias
│   ├── .env.example
│   └── package.json
│
├── backend/                      # Laravel application
│   ├── app/
│   │   ├── Enums/
│   │   ├── Events/  Listeners/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/<Module>/
│   │   │   ├── Middleware/
│   │   │   ├── Requests/<Module>/
│   │   │   └── Resources/<Module>/
│   │   ├── Jobs/
│   │   ├── Models/
│   │   ├── Notifications/
│   │   ├── Policies/
│   │   └── Services/<Module>/
│   ├── bootstrap/                # app.php: middleware, exceptions, routing
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── routes/
│   │   ├── api.php               # Loads versioned route files
│   │   ├── api/v1/*.php          # One file per module
│   │   └── console.php           # Scheduled tasks
│   ├── public/                   # ONLY web-exposed folder (index.php, storage link)
│   ├── storage/                  # Logs, cache, uploaded files (private + public)
│   ├── tests/  (Feature, Unit)
│   ├── .env.example
│   └── composer.json
│
├── .gitignore
└── README.md
```

| Directory | Responsibility |
|---|---|
| `docs/` | Single source of truth for decisions across all steps |
| `api-collection/` | Shared, version-controlled API test requests |
| `frontend/app/` | Routes, layouts, page-level data loading only |
| `frontend/components/` | Reusable presentation; no direct API calls in `ui/` |
| `frontend/services/` | The only place that knows endpoint URLs |
| `frontend/schemas/` | Validation shapes reused by forms |
| `backend/app/Services/` | Business logic and transactions |
| `backend/app/Policies/` | Who may do what |
| `backend/routes/api/v1/` | Versioned public contract |
| `backend/public/` | The only folder the web server exposes |

Confirmed: Hostinger's Node.js deployment builds from a sub-folder (Root directory = `frontend`), so the monorepo stays as is.

---

## 12. Development Tools & Essential Packages

### 12.1 Local development (Windows)

| Tool | Purpose |
|---|---|
| VS Code | Editor — extensions: ESLint, Prettier, Tailwind CSS IntelliSense, PHP Intelephense, Laravel |
| Node.js (LTS) + pnpm | Frontend runtime and package manager |
| PHP 8.3+ + Composer | Backend runtime and package manager |
| Laravel Herd or Laragon | Local PHP + MySQL environment on Windows |
| MariaDB (same engine as Hostinger production) | Local database |
| Git + GitHub (private repo) | Version control |
| Bruno (preferred) or Postman | API testing; Bruno collections live in the repo |

### 12.2 Frontend packages

| Package | Purpose |
|---|---|
| `next`, `react`, `react-dom` | Framework |
| `tailwindcss` (+ its PostCSS plugin) | Styling |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Forms + validation |
| `axios` | Browser HTTP client with cookie/XSRF support |
| `lucide-react` | Icons |
| `clsx`, `tailwind-merge` | Conditional class names (small utilities) |
| `@reduxjs/toolkit`, `react-redux` | **Only when a genuine need is approved** |
| Dev: `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss` | Code quality |

### 12.3 Backend packages

| Package | Purpose |
|---|---|
| `laravel/framework` | Framework |
| `laravel/sanctum` | SPA authentication |
| `spatie/laravel-permission` | Roles & permissions |
| Dev: `laravel/pint` | Code style |
| Dev: `pestphp/pest` (or PHPUnit) | Testing |

Any additional package requires a stated reason (requirement it serves, maintenance status, alternatives considered).

### 12.4 Git workflow

- `main` = production; `develop` = integration; `feature/<name>` branches merged via pull request.
- Conventional commit messages (`feat:`, `fix:`, `docs:` …).
- `.env` files, `vendor/`, `node_modules/`, `.next/` are git-ignored.

---

## 13. Architecture Decision Record

| ID | Decision | Rationale | Consequence |
|---|---|---|---|
| ADR-01 | Next.js App Router, JavaScript, as the only frontend | SEO-friendly SSR + interactive dashboards in one app | Needs a Node.js runtime → plan must include Node.js |
| ADR-02 | Laravel REST API as the single backend and owner of business logic | Mature, batteries-included, runs on Hostinger PHP | Next.js never duplicates business logic |
| ADR-03 | MySQL as the only database | Relational integrity, DECIMAL money, included in hosting | No MongoDB/PostgreSQL unless a future requirement justifies it |
| ADR-04 | Separate frontend and backend, modular-monolith backend | Independent deployment and scaling; avoids microservice overhead | Two deployments to manage |
| ADR-05 | Same root domain: `jaymamotors.com` + `api.jaymamotors.com` | Enables Sanctum cookie auth with CSRF | Both apps must stay under `jaymamotors.com` |
| ADR-06 | Sanctum SPA cookie authentication | HttpOnly cookies are safer than JS-readable tokens | CORS + CSRF configuration required; tokens only for a future mobile app |
| ADR-07 | Spatie roles/permissions on a single `users` table | One auth system for customers, staff, admins | Roles defined in Step 2/3 |
| ADR-08 | Server Components by default; minimal client state | Performance, less JS, simpler state | Redux only by explicit need |
| ADR-09 | Money stored as DECIMAL, transferred as strings | Exact arithmetic | No float math on money anywhere |
| ADR-10 | Hostinger **Unlimited** plan | Cheapest plan that runs Node.js + PHP + MySQL | Shared resources; no persistent workers/Redis/websockets |
| ADR-11 | Queues via `database` driver + cron-run scheduler | Works on shared hosting | Small delay (≤ 1 min) on queued jobs |
| ADR-12 | GoDaddy stays registrar; DNS managed at Hostinger | One place for DNS, SSL, email | Existing GoDaddy DNS records must be migrated |
| ADR-13 | Upgrade path Unlimited → Cloud Startup → VPS | Scale only when requirements demand it | No code changes required to move |
| ADR-14 | Laravel-native JSON response shapes, `/api/v1` versioning | Consistency with minimal custom code | Breaking changes require `/v2` |

---

## 14. Locked Technical Decisions

1. **Frontend:** Next.js App Router, JavaScript (no TypeScript), Tailwind CSS, React Hook Form + Zod, Axios/fetch, Lucide React.
2. **Redux Toolkit:** not used by default; added only for genuinely shared client state.
3. **Backend:** Laravel REST API, PHP 8.3+, modular monolith, thin controllers + services + policies + Form Requests + API Resources.
4. **Database:** MySQL-family — **MariaDB** on Hostinger and locally (`DB_CONNECTION=mariadb`), InnoDB, utf8mb4, UTC, DECIMAL money.
5. **Auth:** Laravel Sanctum SPA cookie mode with CSRF; no tokens in localStorage.
6. **Authorization:** Spatie Laravel Permission + Laravel Policies, always enforced server-side.
7. **API:** REST, JSON, `https://api.jaymamotors.com/api/v1`, Laravel-native response format.
8. **Business logic:** lives only in Laravel; Next.js does not re-implement it via Route Handlers or Server Actions.
9. **Domains:** `jaymamotors.com` (frontend), `api.jaymamotors.com` (backend); GoDaddy registrar, Hostinger DNS.
10. **Hosting:** Hostinger Unlimited plan — Node.js app (Next.js) + PHP subdomain (Laravel) + MySQL + email.
11. **Background work:** database queue + cron-driven scheduler; no Redis/websockets at launch.
12. **Security:** HTTPS everywhere, strict CORS, rate limiting, validated uploads stored safely, secrets only in environment variables.
13. **Repository:** GitHub, monorepo `frontend/` + `backend/` + `docs/` (Hostinger builds the `frontend` sub-folder directly).
14. **Not used:** React + Vite, Blade as primary UI, Django, Express/NestJS, Go, MongoDB, PostgreSQL, microservices, unnecessary packages.

Any change to a locked decision requires a written trade-off analysis and explicit approval.
