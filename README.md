# Ruththra Portfolio

portfolio-mjcuhw91d-ruththras-projects.vercel.app

A production-focused personal portfolio for Ruththiragayan Sutharsan: a responsive, accessible Next.js experience with a celestial visual system, data-driven content, restrained GSAP motion, and a validated contact pipeline.

## Screenshots

Add current desktop and mobile captures here after personal avatar assets and content are supplied.

## Stack

Next.js App Router, React, strict TypeScript, Tailwind CSS, GSAP/ScrollTrigger, Lucide, Zod, React Hook Form, Resend, Vitest/Testing Library, Playwright, ESLint, and Prettier.

## Architecture

- `src/app` — routes, metadata, contact API, robots, sitemap
- `src/components/layout` — navigation and footer
- `src/components/sections` — homepage sections
- `src/components/animations` — isolated client-side motion
- `src/components/ui` — reusable presentation primitives
- `src/config/site.ts` — personal configuration and optional links
- `src/data` — typed skills, projects, blogs, and journey data
- `src/lib` — shared validation and pure helpers
- `public/media/avatar` and `public/resume` — user-supplied assets
- `tests` and `e2e` — unit/component and browser smoke tests

Server Components are the default. Only navigation, typing/GSAP, and the contact form ship client code.

## Local setup

Requires Node 20+ and pnpm 10.

```bash
corepack enable
pnpm install
cp .env.example .env.local
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
```

## Environment and contact delivery

Copy `.env.example` to `.env.local`. Production email requires `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL`. The from address must use a Resend-verified domain. Without them, development validates and logs only name, subject, and message length; production returns a clear configuration error.

Turnstile is optional. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` together, add a Turnstile widget/token to the form when enabling it, and register the deployed hostname in Cloudflare. Server verification is already enforced whenever the secret is present.

## Personalization

- Edit names, URLs, public email, site origin, and navigation in `src/config/site.ts`.
- Add verified project records in `src/data/projects.ts`.
- Add published posts in `src/data/blogs.ts`; drafts are filtered out.
- Follow `public/resume/README.md` for the résumé.
- Follow `public/media/avatar/README.md` for portrait layers and transitions.

Optional URLs are checked before rendering links, so empty values remain non-broken.

## Vercel deployment

Import the repository in Vercel, keep the detected Next.js settings, add production environment variables, and deploy. Set `siteUrl` in `src/config/site.ts` to the final origin for canonical sitemap URLs and metadata.

## Testing, accessibility, and motion

CI runs lockfile installation, lint, strict typecheck, unit tests, and production build. Playwright covers route and interaction smoke tests.

The site includes semantic regions, a skip link, visible focus, labeled controls, mobile-menu focus containment, live form feedback, strong contrast, and keyboard-accessible navigation. Reduced-motion mode removes pinned/scrubbed animation and repeated movement. Mobile uses a short static layout instead of an extended pin.

## Known limitations

- Personal avatar layers, transition videos, résumé, social URLs, email, real projects, and published posts await owner-supplied data.
- Turnstile requires adding Cloudflare’s client widget before setting its secret.
- Visual project/blog imagery will appear only after content records and assets are supplied.
