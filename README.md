# Jayma Motors

Website and workshop management system for **Jayma Motors**, a multi-brand car service and repair workshop in Vatara, Dhaka (since 2008).

| Part | Technology | Folder |
|---|---|---|
| Frontend | Next.js 16 (App Router, JavaScript), Tailwind CSS 4 | [frontend/](frontend/) |
| Backend API | Laravel 13 (PHP 8.4), Sanctum, Spatie Permission | [backend/](backend/) |
| Database | MariaDB 11.4 (same engine as Hostinger) | — |
| Planning | Steps 1–7 (architecture, requirements, workflows, schema, UI/UX, frontend, API) | [docs/](docs/) |

## Local development (Windows)

Requirements: PHP 8.4, Composer, Node.js 22, pnpm 9, MariaDB 11.4.

### Backend — http://localhost:8000

```sh
cd backend
composer install
copy .env.example .env        # then fill DB_PASSWORD, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

Tests use the `jayma_motors_test` database: `php artisan test`. Code style: `php vendor/bin/pint`.

### Frontend — http://localhost:3000

```sh
cd frontend
pnpm install
copy .env.example .env.local  # set REVALIDATE_SECRET to match the backend
pnpm dev
```

Checks: `pnpm lint`, `pnpm build`, `pnpm format`.

## How the two apps talk

- The browser calls the API directly with the Laravel session cookie (Sanctum SPA auth, CSRF protected).
- Logged-in pages are rendered by Next.js on the server, forwarding the visitor's cookie to the API.
- Public pages are cached by Next.js for 10 minutes; Laravel calls `POST /api/revalidate` to refresh them when content changes.

Details: [docs/01-technical-architecture.md](docs/01-technical-architecture.md), [docs/06-frontend-architecture.md](docs/06-frontend-architecture.md), [docs/07-backend-api-specification.md](docs/07-backend-api-specification.md).

## Build progress (Step 8)

| Milestone | Scope | Status |
|---|---|---|
| B0 / F0 | Foundation: projects, database, roles, layouts, design tokens | ✅ Done |
| B1 / F1 | Authentication | Next |
| B2–B11 / F2–F11 | Modules, see Step 6 §15 and Step 7 §17 | Planned |
