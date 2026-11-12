# IPPLY — The World's Studio

> Created by anyone. Loved by everyone.

IPPLY is an open-access entertainment studio. Anyone can create original IP (characters, worlds, films, music, theatre, books, games, design), publish it to a cinematic public catalogue, attract an audience, and receive structured commercial enquiries from toy companies, studios, publishers and brands. Creators keep ownership of their work.

This repository is the **Version 1 MVP**. It covers the full journey from a creator's idea to a serious licensing enquiry: a public website, a creator studio, a partner portal and an internal studio (admin) dashboard.

---

## What's in V1

| Area | Route | What it does |
| --- | --- | --- |
| Public site | `/`, `/creators`, `/partners`, `/studios`, `/about`, `/principles` | Cinematic homepage and editorial pages, including the creator rights charter |
| Discover | `/discover` | Search (titles, loglines, characters, creators, genres), filter by category, licensing category and "open to deals", sort |
| IP profiles | `/ip/[slug]` | A mini franchise site per project: hero, logline, overview, gallery, world, characters, updates, rights & AI disclosure, contributors, commercial opportunities, follow / save / request to license |
| Creator profiles | `/creators/[handle]` | Public creator page with their published projects |
| Auth | `/join`, `/signin` | Creator or partner registration (partners create their organisation at sign-up) |
| Creator studio | `/dashboard/…` | Overview with real engagement stats, project list, 8-step project editor (basics → story → characters → artwork & media → rights & credits → commercial → publish → updates), media uploads, enquiries inbox with threaded replies and status changes, saved/following, profile |
| Partner portal | `/partner/…` | Organisation profile, shortlist with private notes, structured enquiries (type, categories, territories, exclusivity, term, intended use, proposed terms, budget, launch window), enquiry tracking and messaging |
| Studio dashboard | `/admin/…` | Review queue (approve / request changes), curate featured projects, hide/restore, set rights status with an evidence note, moderation log, enquiry oversight, studio development pipeline (Kanban), bulk hide/show of demo content |

### Functional vs. simulated

**Real and persistent (PostgreSQL):** accounts and sessions, roles, creator profiles, organisations, project creation/editing/drafts, characters, contributors and declared shares, media uploads, key-art style, submission → review → publish workflow, featuring and takedowns, rights status changes, follows, saves/shortlists, page views, enquiries, enquiry messages and status history, studio pipeline, moderation log.

**Demonstration content:** the seed creates eight fictional projects, their fictional creators, one fictional partner organisation (Northlight Play Co.) and one demo enquiry. Every such record is flagged `isDemo` and labelled **Demo** throughout the UI. No followers, views, verified rights, deals, partnerships or earnings are invented — counts start at zero and reflect real activity on your instance. All demo rights are "creator-declared".

**Generated key art:** projects without an uploaded cover get a generative, poster-style SVG (motif + palette + seed). It is deliberately abstract so it never pretends to be the creator's own artwork. Uploading an image replaces it.

**Not built yet (and never simulated as complete):** payments, contract execution, royalty reporting and distribution, automated rights verification, organisation identity verification, email notifications, AI-assisted creative tools. The UI states these clearly where relevant. "Agreed in principle" on an enquiry records intent only.

---

## Product principles encoded in the system

- **Creators own their work.** Nothing in the data model transfers rights. Publishing records a creator declaration (`ownershipDeclaredAt`); licences and development rights are separate records.
- **Rights are trustworthy.** `rightsStatus` defaults to `CREATOR_DECLARED`. Only administrators can change it, and every change requires a recorded note (what evidence was reviewed). "Documented" is never automatic. A `DISPUTED` status pauses enquiries.
- **Multiple contributors and rights holders** per project (`ProjectContributor`, optional declared share in basis points, optional link to an IPPLY account).
- **AI disclosure** is required when a creator says AI tools were used, and shown on the public page.
- **Commercial integrity.** Enquiries require a non-binding acknowledgement; status transitions are constrained (`src/lib/permissions.ts`) so nobody can skip straight to agreement, and partners can only withdraw.

---

## Tech stack

- **Next.js 15** (App Router, React Server Components, Server Actions) + **TypeScript**
- **Tailwind CSS 3** with a small design-token layer (`tailwind.config.ts`, `src/app/globals.css`); typography: Instrument Serif (display) + Inter Tight (text) via `next/font`
- **PostgreSQL** + **Prisma 6** (schema and migrations in `prisma/`)
- **zod** validation for every mutation
- Custom session auth: bcrypt password hashes, random 256-bit session tokens stored **hashed** in the database, HTTP-only `SameSite=Lax` cookies
- Storage abstraction (`src/lib/storage.ts`): local disk for development, any **S3-compatible** store (AWS S3, Cloudflare R2, MinIO…) for production

### Architecture

```
src/
  app/
    page.tsx                 homepage (dark cinematic header)
    (site)/                  public pages with the standard header/footer
    (auth)/                  sign in / join
    dashboard/               creator studio        (role: CREATOR)
    partner/                 partner portal        (role: PARTNER)
    admin/                   studio dashboard      (role: ADMIN)
    actions/                 server actions: auth, projects, enquiries, engagement, profile, admin
    api/upload               authenticated multipart upload (origin check, type sniffing, size/count limits)
    api/media/[...key]       serves local uploads; media of unpublished projects is private
  components/                design system (key art, cards, forms, shells, enquiry thread…)
  lib/                       db, auth, permissions, validation, storage, labels, queries
  middleware.ts              fast cookie gate for private areas
prisma/
  schema.prisma              data model
  migrations/                SQL migrations
  seed.ts                    demonstration content
tests/                       unit tests (permissions, validation, utils)
scripts/e2e-journey.cjs      browser test of the full creator → admin → partner → creator journey
```

**Security model:** middleware only checks that a session cookie exists; the real checks happen server-side — each private area's layout calls `requireUser([role])`, and **every server action re-checks** the user, role and ownership (`assertUser`, `ownedProject`, `enquiryForParty`). Unpublished projects and their media return 404 to anyone but the owner and admins. Server Actions get Next.js's built-in origin check; the upload route checks `Origin` explicitly. Redirect targets are restricted to same-site paths. Basic in-memory rate limits protect sign-in, sign-up, uploads, enquiries and view counting.

### Data model (summary)

`User` (role CREATOR / PARTNER / ADMIN) · `Session` · `CreatorProfile` · `Organization` + `OrganizationMember` · `Project` (category, status, rights status, AI disclosure, licensing categories, curation flags, `isDemo`) · `ProjectContributor` · `Character` · `MediaAsset` · `ProjectUpdate` · `Follow` · `SavedProject` (partner shortlist, with note) · `ProjectViewDaily` · `Enquiry` + `EnquiryMessage` (messages and status events) · `StudioOpportunity` · `ModerationEvent` (audit log).

Built to grow: organisations already support multiple members; enquiries already carry categories × territories × exclusivity × term, which maps onto a future `Agreement`/`RightsGrant` model for royalty reporting and multi-territory distribution.

---

## Getting started

### Requirements

- Node.js 20+
- PostgreSQL 14+ (local, Docker, or a hosted service such as Neon, Supabase or RDS)

### Setup

```bash
npm install
```

```bash
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL`. To run Postgres locally with Docker:

```bash
docker run -d --name ipply-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ipply -p 5432:5432 postgres:16
```

Create the schema and load demonstration content:

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

Start the dev server at http://localhost:3000:

```bash
npm run dev
```

### Demo accounts

The seed creates three accounts. Their password is `SEED_DEMO_PASSWORD` (default `ipply-demo-2026` — **change it** anywhere public).

| Role | Email | Try this |
| --- | --- | --- |
| Creator | `creator@ipply.demo` | Edit *Pip & the Lantern Moths*, reply to the Northlight enquiry, create a new project |
| Partner | `partner@ipply.demo` | Browse Discover, shortlist, send an enquiry to *Tidepool Society* |
| Admin | `admin@ipply.demo` | Approve *Night Market Kites* from the review queue, feature it, move it through the studio pipeline |

Re-running `npm run db:seed` deletes and recreates **only** records flagged as demo; real users and projects are untouched.

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `APP_URL` | recommended | Public base URL (used for metadata) |
| `STORAGE_DRIVER` | no | `local` (default) or `s3` |
| `UPLOAD_DIR` | no | Directory for local uploads (default `.uploads`) |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL` | with `s3` | S3-compatible storage. `S3_PUBLIC_BASE_URL` is the public URL prefix serving the bucket's objects |
| `SEED_DEMO_PASSWORD` | no | Password for seeded demo accounts |

### Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser journey against a running, seeded app (needs Playwright + Chromium; set `BASE_URL`, `SEED_DEMO_PASSWORD`) |
| `npm run db:migrate` | Create/apply a migration after editing `schema.prisma` (development) |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:seed` | Reset demonstration content |
| `npm run db:reset` | Drop and recreate the database, then seed (destructive) |

---

## Deployment

### Vercel (or any serverless host)

1. Provision PostgreSQL (e.g. Neon) and add `DATABASE_URL` in **Settings → Environment Variables** (tick Production). Prefer the **direct** (non-pooled) connection string so migrations can run.
2. Optionally add `SEED_DEMO_PASSWORD`.
3. Leave the Build Command on its default. Vercel runs the `vercel-build` script, which applies migrations, loads demo content **only if the database has no projects yet**, and builds the app.
4. For uploads, set `STORAGE_DRIVER=s3` and the `S3_*` variables — serverless filesystems are ephemeral, so local uploads will not persist.

### Docker / Railway / Fly / Render

The included `Dockerfile` builds a production image and runs `prisma migrate deploy` on start:

```bash
docker build -t ipply .
```

```bash
docker run -p 3000:3000 -e DATABASE_URL=postgresql://… -e STORAGE_DRIVER=s3 -e S3_BUCKET=… ipply
```

If you keep `STORAGE_DRIVER=local`, mount a persistent volume at `UPLOAD_DIR`.

### Before a public launch

- Replace the in-memory rate limiter (`src/lib/rate-limit.ts`) with a shared store (Redis/Upstash) when running more than one instance.
- Add transactional email (enquiry notifications, password reset, email verification).
- Publish real terms of service and a privacy policy; the creator rights charter is a product summary, not legal terms.
- Change or remove the demo accounts, and use **Studio dashboard → Demo content → Hide all demo** once real creators have published.

---

## Roadmap (next)

1. Email notifications and password reset
2. Organisation verification and multi-member organisations (invites)
3. AI-assisted development tools (story structure, worldbuilding, pitch decks), with authorship tracking
4. Deal rooms: term sheets, versioned proposals, e-signature integration
5. Agreements and rights grants by category × territory × term; royalty reporting
6. Creator subscriptions and enterprise plans (billing)
7. IPPLY Studios production tracking; IPPLY Products and Experiences
