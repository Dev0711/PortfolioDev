# Portfolio + Admin CMS

A personal portfolio for a Software Engineer / Product Engineer, with a private admin dashboard at `/admin`. Built with **Next.js 16 (App Router, Cache Components)**, **TypeScript**, **Tailwind CSS 4**, **shadcn/ui**, **Supabase** (Postgres, Auth, Storage), **Motion for React** and **GSAP ScrollTrigger**.

All portfolio content lives in Supabase and is edited through `/admin`. Publishing updates the live site without a redeploy (tag-based cache invalidation).

> **Status:** the code builds, typechecks and lints cleanly, and the public site renders. The Supabase integration, RLS policies, uploads and admin flows have **not yet been exercised against a live Supabase project** — follow the setup below and run the checklist at the end. Without credentials the site runs in clearly-labelled *preview mode* using starter content from `supabase/seed/content.ts`.

## Design direction

Researched from the Awwwards portfolio collection (Abhay Rohit, Hanusek Studio, Arshawn Arbabi, Yehor Herasymenko, Denny Pratama, JLD'2nd, among others). Ideas taken, not copied: dark editorial base with one warm signal colour; a grotesk + italic serif + mono type system with numbered mono labels; a live "system topology" canvas as the default hero background; a pinned horizontal scroll rail for principles; quick curtain page transitions; pointer-lit cards; a local-time footer. Everything is original code and layout.

- Fonts: Inter Tight, Instrument Serif (italic accents), JetBrains Mono.
- Accent colours are editable in **Admin → Settings**.
- Backgrounds: upload an image or a looping video in **Admin → Settings → Hero background**, and cover images/videos per project. Without uploads, a generative canvas / SVG diagram is used (never stock screenshots).
- Motion rules: CSS for hover states, Motion for component/scroll animation, GSAP only for the pinned horizontal rail (loaded on demand, desktop only). `prefers-reduced-motion` is honoured; cursor, parallax and the rail are disabled on touch/small screens; content is present in the HTML without JavaScript.

## Requirements

- Node.js 20.9+ (tested on 24)
- A Supabase project (free tier is fine)

## Setup

```bash
npm install
cp .env.example .env.local
```

### 1. Create the Supabase project

1. Create a project at <https://supabase.com>.
2. **Project Settings → API**: copy the project URL and the *publishable* (anon) key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Copy the *service role* key into `SUPABASE_SERVICE_ROLE_KEY`. It is used **only** by the two scripts in `/scripts` on your machine. The app never reads it. Never deploy it to Vercel.
4. **Authentication → Providers → Email**: keep email/password enabled and **turn off "Allow new users to sign up"** (admin is invite-only; also guarded by the `admins` table).

### 2. Run the migrations

Migrations live in `supabase/migrations/` (apply in order):

| File | Purpose |
| --- | --- |
| `20261112000100_schema.sql` | Tables, enums, triggers |
| `20261112000200_rls.sql` | `is_admin()`, RLS policies, grants |
| `20261112000300_storage.sql` | `media` bucket + storage policies |
| `20261112000400_contact_rpc.sql` | Rate-limited contact-form function |

With the Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Or paste each file, in order, into **SQL Editor** in the dashboard.

### 3. Create the administrator

```bash
npm run create-admin -- you@example.com "a-strong-password-12+"
```

This creates the auth user and adds them to `public.admins` with role `owner`. The `admins.role` enum (`owner`, `editor`) is the hook for adding narrower roles later.

### 4. Seed starter content (optional)

```bash
npm run seed
```

Inserts the profile, settings, skills and **sample** project/experience entries. It never overwrites an existing profile/settings row unless `--force` is passed. The sample entries are placeholders — replace or delete them in the admin before publishing. Nothing in the seed claims real employers, results or metrics.

### 5. Run

```bash
npm run dev        # http://localhost:3000, admin at /admin
npm run build && npm start
```

## Environment variables

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | app + scripts | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | app | Anon/publishable key (public by design; RLS protects data) |
| `NEXT_PUBLIC_SITE_URL` | app | Canonical origin for metadata, sitemap |
| `CONTACT_HASH_SALT` | app (optional) | Salt for hashing sender IPs for rate limiting |
| `SUPABASE_SERVICE_ROLE_KEY` | scripts only | **Never** set in Vercel or expose to the browser |

## Architecture

- `src/app/(site)` – public pages (`/`, `/work`, `/work/[slug]`, `/about`, `/contact`).
- `src/app/admin` – CMS. `login` is public; everything under `(dashboard)` is gated.
- `src/lib/content/queries.ts` – cached (`use cache`) public reads via a cookie-less anon client, tagged per content type.
- `src/lib/admin/actions/*` – server actions. Each one: `requireAdmin()` → Zod validation → HTML sanitisation → write via the user's own session (RLS is the final gate) → `updateTag` to refresh the public site.
- `src/proxy.ts` – refreshes the session and does an optimistic redirect for `/admin`. It is **not** the security boundary.
- `supabase/seed/content.ts` – starter content, also used for preview mode.

### Security model

- RLS enabled on every table. Anonymous visitors can read only published projects/experience and the always-public singletons. Only users in `public.admins` can write.
- `contact_messages` has no anon policy; submissions go through `submit_contact_message()` (validates again, rate-limits 3/hour per hashed IP and 60/hour globally). The form also has a honeypot and a minimum fill time.
- Storage: public-read bucket, but upload/update/delete/list policies require `is_admin()`. Bucket enforces MIME types and a 50 MB ceiling; the app enforces 8 MB images / 50 MB video / 10 MB PDF.
- Server-side session check on every admin layout, page and action (`getUser()`, plus the `admins` row). Login errors are generic.
- Rich text is sanitised on save (`sanitize-html` allow-list). The service-role key is never imported by app code.

## Deploying to Vercel

1. Push the repo and import it in Vercel (framework: Next.js).
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` (your production URL) and optionally `CONTACT_HASH_SALT`. Do **not** add the service-role key.
3. In Supabase **Authentication → URL Configuration**, set the Site URL to your production URL.
4. Deploy. Content edits in `/admin` go live without a redeploy.

## Verification checklist (run this after connecting Supabase)

- [ ] `/admin` redirects to `/admin/login` when signed out; a non-admin auth user cannot get in.
- [ ] Create a project → save draft → confirm it is **not** at `/work` or `/work/<slug>` → preview → publish → it appears without redeploying → unpublish → it disappears.
- [ ] Reorder projects, sections and gallery images by drag and by keyboard.
- [ ] Upload an image, a video and a PDF; replace one; try deleting one that is in use (should be refused).
- [ ] Anonymous request to `contact_messages` and to `projects?status=eq.draft` via the REST API returns nothing.
- [ ] Submit the contact form; message appears in `/admin/messages`; a 4th submission within the hour is rate limited.
- [ ] Change accent colour, section order/visibility and nav in Settings; confirm on the live site.
- [ ] Lighthouse (mobile) and a keyboard-only / screen-reader pass.

## Scripts

`npm run dev` · `build` · `start` · `lint` · `typecheck` · `seed` · `create-admin`

## Known limitations

- Not yet tested against a live Supabase project (see Status).
- Admin editing assumes a single administrator at a time (last write wins).
- Media replacement keeps the same URL; CDN caches can take a few minutes to refresh.
- Reordering saves one update per row (fine at portfolio scale).
