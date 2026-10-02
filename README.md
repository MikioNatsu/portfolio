<div align="center">

# NATSU

**Frontend Developer · Anime Creator**

A full-stack portfolio: a cinematic, anime-inspired public site backed by a real
CMS — NestJS API, PostgreSQL, Prisma, JWT authentication and a working admin panel.

`React` · `TypeScript` · `Vite` · `Tailwind CSS` · `Framer Motion` · `NestJS` · `Prisma` · `PostgreSQL`

</div>

---

## Overview

The public site is **entirely content-managed**. Nothing a visitor reads is hardcoded
in a component: the profile, statistics, projects, case studies, experience, skills,
social links, contact details and SEO metadata all come from PostgreSQL through the
NestJS API and are edited from the admin panel.

The visual language is intentional — deep navy and dark purple, neon violet and
magenta, editorial serif display type, glass surfaces, sakura petals, a generated
hero scene and a custom cursor — but it is built from real components, real routes
and real data, not a screenshot.

Two behaviours worth knowing about up front:

1. **The site never breaks when the API is down.** Every content hook falls back to a
   bundled dataset (`apps/web/src/data/fallback.ts`) that mirrors the seed, so a cold
   start or a stopped backend still renders a complete, designed experience.
2. **Images are never broken.** Missing artwork renders as generated cover art with
   the correct aspect ratio — layouts stay stable whether or not an image exists.

---

## Features

**Public website**

- Cinematic hero with a generated SVG scene (skyline, halo, character, rim light,
  particles) that also hosts a real uploaded artwork when one is configured
- Floating micro-UI: currently-building widget, status card, ambient music player
  (never autoplays), vertical Japanese annotation
- Asymmetric editorial project grid with pointer-tracked spotlight and border glow
- Project case studies at `/projects/:slug` — overview, problem, solution, features,
  architecture, challenges, implementation, results, gallery with a fullscreen viewer
- About, Skills (generated tech glyphs, no progress bars), glowing experience timeline
- Contact form with idle / loading / success / error states and a honeypot field
- Sakura petals, aurora blobs, grid and film-grain atmosphere, scroll progress bar
- Two ambient themes: **Midnight** and **Sakura**
- Desktop-only custom cursor with a magnetic ring over interactive elements
- Full keyboard support, visible focus states and `prefers-reduced-motion` respect
- SEO: dynamic titles, Open Graph and Twitter metadata, canonical URLs, JSON-LD
  (Person, WebSite, CreativeWork, BreadcrumbList), `robots.txt` and a sitemap generator

**Admin panel** (`/admin`) — an Apple-inspired system UI, separate from the site's look

- **Light, dark or automatic appearance**, stored per device and applied before first
  paint (no colour flash); iPadOS-style grouped sidebar with an unread-messages badge
- **⌘K / Ctrl+K command palette**: jump to any page, open a project by name, create
  content, switch appearance or sign out — fully keyboard driven
- JWT login (httpOnly cookie + bearer token), protected routes, session restore; a
  wrong password shakes the form and returns focus to the field
- Dashboard: greeting, counted-up summary tiles, 30-day views chart, recent messages,
  library shortcuts and recent activity
- Projects CMS: debounced search, status filter, **optimistic** publish / feature
  toggles with rollback, responsive rows that recompose on phones
- Experience & Skills CMS: **drag-to-reorder** (pointer, touch, or arrow keys on the
  handle, with screen-reader announcements), saved optimistically
- Messages: Mail-style split view on large screens, bottom sheet on phones, optimistic
  read / unread, reply by email
- Profile & Settings load the **stored** records from the admin API — unpublished
  statistics and links stay visible and are never dropped on save
- Forms: floating "unsaved changes" bar, **⌘S / Ctrl+S** to save, discard, a
  leave-page warning, inline validation that focuses the first invalid field
- Analytics: smooth monotone chart with hover / keyboard inspection, animated
  breakdowns, segmented 7 / 30 / 90-day ranges that keep data on screen while loading
- Image uploads (Cloudinary when configured, local disk otherwise) with drag-and-drop
  and URL fallback
- Sheets, alerts and menus trap focus and close on Escape; motion honours
  `prefers-reduced-motion`

**API**

- Public content endpoints plus a fully separated `/api/admin/*` surface
- Secure by default: every route requires a JWT unless explicitly marked `@Public()`
- DTO validation everywhere (whitelist + `forbidNonWhitelisted`), centralised exception
  filter, rate limiting on contact, login, analytics and uploads
- Helmet, CORS allow-list, hashed passwords (bcrypt, cost 12), JWT expiry
- Swagger documentation at `/api/docs` outside production

---

## Tech stack

| Layer      | Technology                                                             |
| ---------- | ---------------------------------------------------------------------- |
| Frontend   | React 18, TypeScript (strict), Vite 5, Tailwind CSS 3, Framer Motion 11 |
| Data layer | TanStack Query 5, typed fetch client with graceful fallback            |
| Backend    | NestJS 10, TypeScript, Passport JWT, class-validator, Swagger          |
| Database   | PostgreSQL 16 with Prisma ORM                                          |
| Storage    | Cloudinary or local disk (S3-compatible by swapping the driver)        |
| Email      | Resend or SMTP (nodemailer) — both optional                            |
| Testing    | Vitest, React Testing Library, Supertest                               |
| Tooling    | ESLint, Prettier, Docker, Docker Compose                               |

---

## Architecture

```
natsu-portfolio/
├── apps/
│   ├── web/                     React + Vite SPA
│   │   ├── src/
│   │   │   ├── animations/      Framer Motion variants & easings
│   │   │   ├── api/             Typed API client (public + admin)
│   │   │   ├── components/      UI primitives, effects, feature components
│   │   │   ├── data/            Fallback content (API-down resilience)
│   │   │   ├── hooks/           Content, auth, analytics, meta, theme
│   │   │   ├── layouts/         PublicLayout, AdminLayout
│   │   │   ├── lib/             utils, constants, env, SEO builders
│   │   │   ├── pages/           Route components (+ pages/admin)
│   │   │   └── sections/        Composed page sections
│   │   └── public/              favicon, og-image, robots.txt, sitemap.xml
│   │
│   └── api/                     NestJS API
│       ├── prisma/
│       │   ├── schema.prisma    Data model
│       │   └── seed.ts          Idempotent seed
│       └── src/
│           ├── auth/            JWT login, strategy, guards
│           ├── profile/         Profile + statistics
│           ├── projects/        Projects + case studies
│           ├── experience/      Timeline entries
│           ├── skills/          Skill grid
│           ├── social-links/    Social links
│           ├── contacts/        Contact inbox + mail service
│           ├── analytics/       First-party analytics + dashboard overview
│           ├── uploads/         Image uploads (Cloudinary / local)
│           ├── settings/        Site settings (SEO, footer, toggles)
│           ├── health/          Liveness + DB probe
│           ├── common/          Guards, filters, interceptors, DTOs, utils
│           └── config/          Typed configuration factory
│
├── packages/
│   ├── types/                   Shared type-only domain contracts
│   └── config/                  Shared tsconfig presets
│
├── scripts/                     env bootstrap, sitemap generator
├── docker-compose.yml
└── .env.example
```

Data flow:

```
PostgreSQL → Prisma → NestJS service → controller → TanStack Query → React component
                                   ↑
                        Admin panel (JWT) writes back
```

`packages/types` is **type-only** (no runtime output), so both apps consume it with
`import type` — no build step, no bundler alias, no runtime resolution issues.

---

## Environment variables

Copy the template and fill in real values:

```bash
cp .env.example .env
cp .env.example apps/api/.env   # the Prisma CLI reads this one
# or simply:
npm run env:init
```

| Variable                                                     | Required    | Notes                                                       |
| ------------------------------------------------------------ | ----------- | ----------------------------------------------------------- |
| `DATABASE_URL`                                               | ✅          | PostgreSQL connection string                                |
| `JWT_SECRET`                                                 | ✅ (prod)   | 48+ random bytes. Boot fails in production if unset          |
| `JWT_EXPIRES_IN`                                             | –           | Defaults to `7d`                                            |
| `FRONTEND_URL`                                               | –           | CORS allow-list origin                                      |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`              | –           | Used by the seed. **Change before any non-local run**       |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET`         | –           | Omit to store uploads on local disk                         |
| `STORAGE_DRIVER`                                             | –           | `local` (default) or `cloudinary`                           |
| `RESEND_API_KEY`                                             | –           | Preferred email provider                                    |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD`    | –           | Fallback if Resend is not set                               |
| `CONTACT_EMAIL` / `EMAIL_FROM`                               | –           | Where contact notifications go / envelope sender            |
| `REDIS_URL`                                                  | –           | Optional; used for caching and shared rate-limit state      |
| `VITE_API_URL`                                               | –           | Empty string means same-origin (recommended in production)  |
| `VITE_SITE_URL`                                              | –           | Absolute origin used for canonical and Open Graph URLs      |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> Secrets are never committed. `.env` is gitignored; only `.env.example` ships.

---

## Getting started

### With Docker (fastest)

```bash
cp .env.example .env
docker compose up -d --build

# first run only — apply the schema and seed demo content
docker compose exec api npx prisma migrate deploy
docker compose exec api npx ts-node --transpile-only prisma/seed.ts
```

- Web → <http://localhost:8080>
- API → <http://localhost:4000/api>
- Swagger → <http://localhost:4000/api/docs>

### Locally

Requires **Node 20+** and a **PostgreSQL 16** instance.

```bash
npm run setup          # creates .env files, installs, generates, migrates, seeds
npm run dev            # api on :4000, web on :5173
```

Or step by step:

```bash
npm install
npm run env:init                     # .env + apps/api/.env from the template
# edit .env → set DATABASE_URL and JWT_SECRET
npm run db:generate                  # prisma generate
npm run db:migrate -- --name init    # prisma migrate dev (prompts if you omit the name)
npm run db:seed                      # admin user + demo content
npm run dev
```

The frontend runs without the backend too — it falls back to bundled content, which
is useful for design work.

### Troubleshooting setup

**`npm install` skips devDependencies.** If your shell exports `NODE_ENV=production`,
npm omits dev packages and Vite/Vitest will be missing. Install with:

```bash
npm install --include=dev
```

**Prisma cannot create its shadow database.** `prisma migrate dev` needs the role to
be able to create databases. Grant it once:

```sql
ALTER ROLE natsu CREATEDB;
```

---

## Database

Models: `User`, `Profile`, `ProfileStat`, `SocialLink`, `Project`, `ProjectImage`,
`Technology`, `ProjectTechnology`, `Experience`, `ExperienceTechnology`, `Skill`,
`ContactMessage`, `AnalyticsEvent`, `SiteSettings`.

Images are stored as URLs — never as binary blobs.

```bash
npm run db:migrate      # create + apply a migration (development)
npm run db:deploy       # apply pending migrations (production)
npm run db:seed         # idempotent seed
npm run db:studio       # Prisma Studio
npm run db:reset        # drop, re-migrate and re-seed
```

The seed is safe to re-run: it upserts by unique keys and replaces the statistic and
social-link sets deterministically.

---

## Development

```bash
npm run dev          # api (watch) + web (vite) together
npm run dev:web      # frontend only
npm run dev:api      # backend only
```

Vite proxies `/api` and `/uploads` to `http://localhost:4000`, so the browser talks
to a single origin in development as well.

---

## Testing, linting and builds

```bash
npm run lint         # ESLint across every workspace
npm run typecheck    # tsc --noEmit across every workspace
npm run test         # Vitest (unit + e2e)
npm run build        # NestJS build, then the Vite production bundle
npm run format       # Prettier
```

The API e2e suite stubs the database, so it validates the real module graph — global
prefix, validation pipe, throttler and the secure-by-default JWT guard — without
needing infrastructure.

### What has been verified

This project was validated end to end against a live PostgreSQL instance:

| Check                                             | Result                                   |
| ------------------------------------------------- | ---------------------------------------- |
| `npm run lint` / `typecheck` / `build`            | clean across all three workspaces        |
| `npm run test`                                    | 90 tests passing (61 web + 29 API)       |
| `prisma migrate deploy` + `db:seed`               | applied and seeded from empty            |
| Live API surface (public, auth, admin, analytics) | 90/90 assertions passing                 |
| Dev server + API proxy                            | serves, proxies `/api` and `/uploads`    |
| Admin visual sweep (every page, light + dark)     | 0 errors, 0 overflow at 1440–320 px      |
| Admin interactions against the live API           | 19/19 browser checks passing             |

The live pass covers: content endpoints, 404 handling, draft isolation, validation
rejections, honeypot suppression, rate limiting (429), login with wrong and right
credentials, forged-token rejection, admin CRUD for every resource, duplicate-slug
conflict (409), and the analytics aggregation.

### Known dependency advisories

`npm audit` reports 0 critical. The remaining high-severity entries are transitive and
upstream-blocked rather than unaddressed:

| Advisory                     | Source                          | Status                                                      |
| ---------------------------- | ------------------------------- | ----------------------------------------------------------- |
| `multer` DoS                 | `@nestjs/platform-express` 10   | Needs Nest 11; uploads are admin-only, rate-limited, ≤5 MB  |
| `js-yaml`, `lodash`          | `@nestjs/cli`, `prisma` (build) | Dev/build tooling only — not in the production runtime      |
| `nodemailer` address parsing | `nodemailer` 6.x                | Mitigated in `sanitiseAddress()`; upgrading to 7.x is next  |

Already patched via direct upgrades and an `express` override in the root
`package.json`: `express`, `react-router-dom`, `cloudinary`, `nodemailer`.

---

## Production notes

```bash
npm run build
npm run start        # serves the API from dist/
npm run preview      # serves the built frontend locally
```

**Frontend** — Vercel, Netlify or any static host. Build command `npm run build -w @natsu/web`,
publish directory `apps/web/dist`. Set `VITE_API_URL` to your API origin (or leave it
empty and proxy `/api` at the edge).

**Backend** — Railway, Render, Fly.io or a VPS. Run `npx prisma migrate deploy` on
release, then `node dist/main.js`. The included Dockerfile is production-ready
(multi-stage, non-root data volume, health check).

**Database** — managed PostgreSQL (Neon, Supabase, RDS, Railway).

**Images** — Cloudinary or any S3-compatible bucket; local disk otherwise.

Checklist before going live:

- [ ] `JWT_SECRET` set to a long random value
- [ ] `ADMIN_PASSWORD` changed after the first login
- [ ] `FRONTEND_URL` set to the real origin (CORS)
- [ ] `VITE_SITE_URL` set so canonical and OG URLs are absolute
- [ ] `npm run db:deploy` run in the release step
- [ ] Social links in the admin panel replaced with your own profiles

---

## Admin access

1. Go to `/admin/login`
2. Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your environment
3. Change the password immediately in any non-local environment

Press **⌘K** (Ctrl+K) anywhere in the admin for the command palette. Appearance
(automatic, light or dark) lives in the account menu and under *Settings*.

The seeded social links point at platform home pages until you replace them — no
invented handles, no fabricated statistics. The seeded statistics (years of
experience, projects completed) are **editable and removable** from
*Admin → Profile*; delete any you cannot stand behind.

---

## Design notes

The hero scene is **drawn, not screenshotted** — a layered SVG composition with a
rotating halo, a dashed orbit, a neon skyline and a character with rim lighting, so it
stays crisp at any size and can never ship a broken image. Upload real artwork in
*Admin → Profile* and it is layered on top of the same lighting rig.

Project imagery follows the same principle: `SmartImage` renders a generated cover
from the project's accent colour, monogram, grid and layered gradients, then
cross-fades to the real image when one exists. The layout is identical either way.

The admin uses a second visual language — calm, Apple-style system UI — without
forking the component library. Shared primitives (`Button`, form fields, `Badge`,
loading / empty / error states) read a `SkinContext`: the public site renders the
default `cinematic` skin, the admin root provides `system`. Admin colours are Apple's
system palette as CSS variables (`sys-*` in Tailwind) under
`html[data-admin-appearance]`, so one set of classes serves light and dark. Motion is
quick and physical: springs for selection pills and segmented controls, the iOS
deceleration curve for sheets and pages. The whole admin shell is code-split, so
public visitors never download it.

---

## Licence

MIT — use it, fork it, make it yours. The name, artwork and copy belong to their owner.
