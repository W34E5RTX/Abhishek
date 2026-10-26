# Abhishek Sharma — Portfolio Platform

A responsive portfolio and service-booking application with a React/TypeScript frontend, Express REST API, and Prisma/Neon PostgreSQL data model.

## Current implementation

The public site includes Home, About, Projects and project-detail, Services and service-detail, Products and product-detail, Contact, Booking, Login/Register, policy-template, and 404 routes. It has responsive navigation, reusable cards and page components, reduced-motion support, page transitions, metadata, sitemap/robots files, and a multi-step validated project inquiry.

The API currently provides database-backed public read routes, contact and booking submission, bcrypt password registration/login/logout/current-user endpoints, email verification and password recovery through Resend, database-backed sessions in HttpOnly cookies, client project/proposal/order read routes with ownership checks, proposal creation and acceptance/rejection, admin overview and paginated booking review, and validated booking status transitions with audit records. The Prisma schema covers the wider portfolio, service, client-project, proposal, product, order, payment, download, content, and audit domains.

The following production workflows are **not complete or enabled yet**: admin CRUD for all content/products/services; payment schedules and milestone administration; cart, checkout, payment-provider order creation and webhook verification; secure object storage and download grants; attachment upload; account deletion; and notification delivery monitoring. Email verification, password recovery, inquiry notifications, proposal creation/acceptance, and the initial booking status workflow are implemented, but require a configured Resend account. Product examples are seeded as drafts and cannot be purchased. Payments and file access are not simulated. Do not describe this project as production-ready until the remaining workflows, deployment configuration, and security review are complete.

## Stack

- React 19, TypeScript, Vite, React Router
- Framer Motion, Lucide React, React Hook Form, Zod
- Express 5, TypeScript, Prisma 6, Neon PostgreSQL
- bcryptjs password hashing, Helmet, strict CORS, rate limits, HttpOnly session cookies
- CSS design tokens and component styles (the current styling is CSS-first; Tailwind utilities are not yet used)

## Prerequisites

- Node.js 20 or newer and npm
- A Neon PostgreSQL project
- A supported Node.js hosting provider for the API

## Local setup

```powershell
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Set `DATABASE_URL` in `.env` to the pooled Neon PostgreSQL connection string for the API runtime, and `DIRECT_URL` to the direct (unpooled) connection string for Prisma schema commands and seeding. The local `.env` is ignored by Git.

Generate the Prisma Client, synchronize the PostgreSQL schema, and add non-sensitive starter content:

```powershell
npm run db:generate
npm run db:push
npm run db:seed
```

The seed adds 24 scoped IT service listings, editable FAQs, nineteen published demo project concepts with local preview artwork across fourteen categories, and eight published demo product listings. All demos are marked as concepts; products are not purchasable and have no downloadable files. These are not claims of completed client work. The seed does not create fake users, customers, paid orders, payments, testimonials, or reviews.

To create the first administrator, set both `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` to private values in the local environment, then run `npm run db:seed`. The script only creates an account if that email is not already in use; it does not promote or overwrite an existing non-admin account. Remove the bootstrap password from the environment after use. There is no shipped default administrator.

Start the Vite frontend and API together:

```powershell
npm run dev
```

The frontend runs at `http://localhost:5173`; Vite proxies `/api` to `http://localhost:4000`. The API reads `API_PORT` and `APP_BASE_URL` from `.env`. The booking and contact form submit to the API and persist only when the database is configured and synchronized.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled Neon connection URL used by Prisma Client in the API |
| `DIRECT_URL` | Direct, unpooled Neon connection URL used by Prisma schema commands and database seeding |
| `APP_BASE_URL` | Exact frontend origin accepted by CORS and browser mutation-origin checks |
| `API_PORT` | Express API listen port |
| `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` | Optional one-time administrator creation during seeding |
| `EMAIL_PROVIDER_API_KEY` / `EMAIL_FROM` | Resend API credentials for verification/reset emails and booking notifications |
| `ADMIN_NOTIFICATION_EMAIL` | Optional destination for new inquiry notifications |
| `STORAGE_*` | Reserved for private S3-compatible object storage; uploads/downloads are not implemented |
| `RAZORPAY_*` / `STRIPE_*` | Reserved for payment integration; checkout and payment verification are not implemented |

No real credentials belong in the repository. `.env` is ignored by Git.

## Database and API

The table and index definitions are in `prisma/schema.prisma`. Run `npm run db:push` to synchronize the PostgreSQL schema. Models use string CUID primary keys. Monetary values are stored as decimal strings to avoid floating-point rounding.

Implemented route groups:

- Public: `GET /api/health`, `/api/projects`, `/api/projects/:slug`, `/api/services`, `/api/services/:slug`, `/api/products`, `/api/products/:slug`, `/api/site-settings/public`
- Inquiries: `POST /api/bookings`, `POST /api/contact`
- Authentication: `POST /api/auth/register`, `/api/auth/verify-email`, `/api/auth/resend-verification`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `GET /api/auth/me`
- Client: dashboard/projects/project detail/proposals/proposal accept or reject/orders
- Admin: dashboard, paginated bookings, validated booking status change

Unimplemented routes must not be inferred from the schema or the original product brief. Client downloads return an explicit unavailable response; payment routes and administrative CRUD are not present yet.

## Security notes

- Passwords are bcrypt-hashed; raw session tokens are random and only their SHA-256 hashes are stored.
- Session cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` in production. Do not move authentication tokens to local storage.
- Role assignment is never accepted from public registration. The initial admin is created only from explicit environment configuration.
- Booking status changes follow an explicit server-side transition map. Submitting an inquiry does not confirm a project or collect payment.
- Client project/proposal/order queries are scoped to the authenticated user. Admin endpoints check the server-side role.
- Public writes are size-limited, validated with Zod, rate-limited, and checked against the configured request origin.
- Razorpay/Stripe and private storage are intentionally unavailable until provider integration, webhook verification, ownership checks, and signed access are implemented. Never turn on live payment credentials against this build.

## Testing and production builds

```powershell
npm test
npm run lint
npm run build
npm run build:api
```

The current automated tests cover booking input validation (required fields, malformed email, consent, and input size). Database integration tests, authorization isolation tests, payment tests, and browser end-to-end tests remain to be added.

## Deployment and SEO

Deploy the repository root to Vercel. `vercel.json` configures the Vite build and static output, while `api/[...path].ts` exposes the Express API as a Vercel Function under `/api`. Configure production environment variables in Vercel before relying on database-backed routes: set `DATABASE_URL` to the pooled Neon PostgreSQL URL, `DIRECT_URL` to the direct/unpooled URL, and `APP_BASE_URL` to the exact HTTPS site origin. The API uses the pooled URL through Prisma Client; schema commands and seeding use the direct URL. Configure email credentials only if verification and notification email should be enabled. Do not upload a local `.env` file or commit production credentials. Run `npm run db:push` from a controlled environment before exposing schema-dependent API code; do not synchronize schema automatically at application startup.

Connect `abhisheksharma.tech` after confirming domain ownership and DNS. Configure the production `APP_BASE_URL` to the exact HTTPS origin. Configure production database credentials, HTTPS, backups, provider webhook URLs, transactional email, and private object storage before enabling those features.

The public UI is a client-rendered Vite SPA. Its initial HTML includes the site title and description, Open Graph and Twitter sharing metadata, and Person structured data. Route-specific titles, descriptions, and canonical URLs are updated after JavaScript executes; this does not guarantee that every crawler will index public pages well. For best discoverability, add prerendering or server-side rendering for public routes and generate a data-driven sitemap when published projects/products are backed by the database. `public/sitemap.xml` lists the primary public routes, and `public/robots.txt` points crawlers to it. Private routes are `noindex` and excluded from the sitemap; server authorization remains mandatory regardless of robots directives.

Policy pages are editable starting templates, not legal advice. Have the actual privacy, service, product license, refund, payment, and terms policies reviewed for the business and applicable laws before publishing.

## Architecture

- `src/` — Vite application, reusable page sections, form validation, and responsive design tokens
- `apps/api/src/` — Express API, request validation, authentication/session handling, role checks, and resource routes
- `prisma/` — PostgreSQL schema and development seed
- `public/` — crawler directives and current public-route sitemap

## Remaining work before the requested production acceptance

1. Connect public components to database-backed content and complete all admin content CRUD.
2. Add email verification, password reset, notifications, and client account lifecycle flows.
3. Implement proposal creation and the full client project/milestone discussion workflow.
4. Implement cart/checkout, Razorpay order/signature/webhook verification, reconciliation, and idempotency tests; enable only with test credentials first.
5. Implement validated private file uploads, object storage, signed downloads, download limits, and audit trails.
6. Add account deletion, privacy workflows, integration and browser tests, accessibility checks, prerendering, deployment smoke tests, and a security review.
