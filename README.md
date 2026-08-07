# Ruththra Portfolio

https://portfolio-nu-silk-13.vercel.app/

A production-focused personal portfolio for Ruththiragayan Sutharsan: a responsive, accessible Next.js experience with a celestial visual system, data-driven content, restrained GSAP motion, a validated contact pipeline, and a private content-management workspace.

## Screenshots

Add current desktop and mobile captures here after personal avatar assets and content are supplied.

## Stack

Next.js App Router, React, strict TypeScript, Tailwind CSS, GSAP/ScrollTrigger, Lucide, Zod, React Hook Form, Resend, Vitest/Testing Library, Playwright, ESLint, and Prettier.

## Architecture

- `src/app` — routes, metadata, contact API, robots, sitemap
- `src/components/layout` — site-wide navigation and footer
- `src/components/sections` — server-rendered homepage composition
- `src/components/animations` — small reusable client-side motion boundaries
- `src/components/ui` — reusable presentation primitives
- `src/features/avatar` — avatar assets, visual layers, animation configuration, and GSAP scene
- `src/features/contact` — form UI, shared schema/types, server-only delivery service
- `src/features/projects` and `src/features/blog` — domain types, records, and selectors
- `src/features/auth`, `src/features/content`, and `src/db` — administrator sessions, managed portfolio content, repositories, and the Drizzle schema
- `src/components/manage` — focused client controls for the private workspace
- `drizzle` and `scripts` — versioned PostgreSQL migration and administrator seed command
- `src/config/site.ts` — personal configuration and optional links
- `src/config/environment.ts` — centralized server-only environment parsing
- `src/data` — shared skills and journey content
- `src/lib` — shared pure helpers
- `public/media/avatar` — user-supplied avatar assets
- `tests` and `e2e` — unit/component and browser smoke tests

Dependency flow is `app → layout/sections → features → database/shared UI/config/lib`. Server Components are the default. Public repositories return published records only; protected pages and APIs validate the opaque database-backed administrator session independently.

### Routes

Public: `/`, `/projects`, `/projects/[slug]`, `/blogs`, `/blogs/[slug]`, `/resume`, and `/privacy`. The only authentication entry is the intentionally unlinked `/login`. Protected routes include `/manage`, the blog workspace, `/manage/content`, `/manage/media`, `/manage/resume`, and `/manage/settings`.

Management APIs are `/api/auth/login`, `/api/auth/logout`, `/api/manage/blogs`, `/api/manage/blogs/[id]`, `/api/manage/preview/[id]`, `/api/manage/content`, `/api/manage/media`, and `/api/manage/resumes`. They are not public content APIs.

### Avatar animation

`AvatarScene` owns the client lifecycle and creates one GSAP match-media context. `avatar.config.ts` centralizes asset paths, breakpoints, ScrollTrigger behavior, timing, and video frame assumptions; `AvatarDecorations` owns the celestial layers. Desktop scrubs the transformation video through the page, while mobile and reduced-motion modes retain the portrait fallback. Cleanup reverts the media context, timeline, listener, timer, and video playback.

### Contact flow

The request flow is `ContactForm → contactSchema → /api/contact → contact.service → Resend`. The Zod schema and discriminated response type are shared safely. Provider access and private environment values are isolated behind `server-only` modules, and the route never returns provider internals. Development still validates without sending; production reports missing delivery configuration.

## Local setup

Requires Node 20+ and pnpm 10.

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm admin:seed
pnpm dev
```

Open `http://localhost:3000`.

## Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm format
pnpm format:check
pnpm db:generate
pnpm db:migrate
pnpm admin:seed
```

## Environment and contact delivery

Copy `.env.example` to `.env.local`. Production email requires `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL`. The from address must use a Resend-verified domain. Without them, development validates and logs only name, subject, and message length; production returns a clear configuration error.

Turnstile is optional. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` together, add a Turnstile widget/token to the form when enabling it, and register the deployed hostname in Cloudflare. Partial email or Turnstile configuration fails clearly. Server verification is enforced whenever the key pair is present.

## Personalization

- Edit names, URLs, public email, site origin, and navigation in `src/config/site.ts`.
- Add verified project records in `src/features/projects/projects.data.ts`.
- Sign in by manually opening `/login`, then manage posts and homepage copy in the private workspace. Do not add this route to public navigation.
- Manage private PDF uploads and choose the public download from **Resume** in the administrator workspace.
- Follow `public/media/avatar/README.md` for portrait layers and transitions.

Optional URLs are checked before rendering links, so empty values remain non-broken.

## Vercel deployment

1. Provision PostgreSQL (Vercel Postgres/Neon or another pooled, TLS-enabled PostgreSQL service), set `DATABASE_URL`, and run `pnpm db:migrate` against it.
2. Locally set `DATABASE_URL`, `ADMIN_SEED_EMAIL`, and a random password of at least 14 characters, then run `pnpm admin:seed`. Remove the two seed credential variables afterward; the password is stored only as a bcrypt hash.
3. Optionally create a Vercel Blob store and set `BLOB_READ_WRITE_TOKEN`. Without it, media management reports that uploads are unavailable; URL fields remain usable.
4. For résumé management, set `NEXT_PUBLIC_SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY`. The private bucket named by `SUPABASE_RESUME_BUCKET` is created on the first upload with PDF-only and 10 MB limits.
5. Import the repository in Vercel, keep the detected Next.js settings, configure production environment variables, and deploy. Set `siteUrl` in `src/config/site.ts` to the final origin.

Database migrations should run as a controlled release step, not concurrently in every serverless function. Back up PostgreSQL using the provider's scheduled backups and point-in-time recovery; keep an independent export before destructive schema work. Blob objects require a separate provider backup/retention policy.

## Management workflow

- Create: open **Blogs → New post**, enter the required title, unique slug, excerpt, Markdown body, author, and category, then save a draft or publish.
- Draft and preview: **Save draft**, then use **Open secure preview**. Preview stays under the session-protected `/manage` tree.
- Publish/unpublish: use **Publish** or **Unpublish** in the editor. Unpublishing clears the public publication timestamp and removes the post from public queries and sitemap generation.
- Delete: choose **Delete post** and accept the explicit irreversible confirmation.
- Homepage: `/manage/content` changes content that belongs to the public portfolio; layout, animation, tokens, and component behavior remain code-owned.
- Résumé: `/manage/resume` uploads PDF files to a private Supabase bucket. Select one file as public; `/resume` issues a short-lived signed download for only that selection.
- Media: upload an allowed image up to 5 MB with meaningful alt text. Deleting an in-use asset can break its saved URL, so remove references first.

## Security notes

Passwords are bcrypt-hashed. Login creates a fresh random opaque session token, stores only its SHA-256 digest in PostgreSQL, and sends the raw token only in an HttpOnly, SameSite=Lax cookie (`Secure` in production). Protected layouts validate non-expired sessions; every management API separately returns `401` or `403`. Login attempts are persisted and limited per IP/account window. Mutations enforce same-origin requests, Zod validation, unique database slugs, and generic errors. Markdown is rendered without raw HTML and passed through `rehype-sanitize`. Public repositories select published posts only. Robots and sitemap output exclude login, management, preview, and API routes.

There is no public registration route. `/login` is absent from the navbar, footer, mobile menu, sitemap, and other public discovery UI.

## Manual verification

- Visit `/login` directly; verify password visibility, invalid credentials, busy state, and keyboard focus.
- Visit `/manage` in a private window; verify redirect to `/login` with a local return URL.
- Sign in, create a draft, and confirm it is absent from `/blogs`, its public slug, page metadata, and sitemap.
- Open its secure preview, publish it, then verify the public list/detail, metadata, cover alt text, tags, date, reading time, and sitemap.
- Attempt a duplicate slug and invalid URL; verify useful validation without internal errors.
- Edit, unpublish, and delete with confirmation. Verify logout invalidates the session and management API calls return `401`.
- At mobile widths, keyboard through management navigation, forms, preview, filters, and confirmation controls.

## Testing, accessibility, and motion

CI runs lockfile installation, lint, strict typecheck, unit tests, and production build. Playwright covers route and interaction smoke tests.

The site includes semantic regions, a skip link, visible focus, labeled controls, mobile-menu focus containment, live form feedback, strong contrast, and keyboard-accessible navigation. Reduced-motion mode removes pinned/scrubbed animation and repeated movement. Mobile uses a short static layout instead of an extended pin.

## Known limitations

- Personal avatar layers, transition videos, résumé, social URLs, email, real projects, and published posts await owner-supplied data.
- Turnstile requires adding Cloudflare’s client widget before setting its secret.
- Visual project/blog imagery will appear only after content records and assets are supplied.
