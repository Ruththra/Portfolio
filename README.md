# Ruththra Portfolio

https://portfolio-nu-silk-13.vercel.app/

A production-focused personal portfolio for Ruththiragayan Sutharsan: a responsive, accessible Next.js experience with a celestial visual system, data-driven content, restrained GSAP motion, and a validated contact pipeline.

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
- `src/config/site.ts` — personal configuration and optional links
- `src/config/environment.ts` — centralized server-only environment parsing
- `src/data` — shared skills and journey content
- `src/lib` — shared pure helpers
- `public/media/avatar` and `public/resume` — user-supplied assets
- `tests` and `e2e` — unit/component and browser smoke tests

Dependency flow is `app → layout/sections → features → shared UI/config/lib`. Server Components are the default: Hero and Skills keep their content on the server while focused children handle typing, scroll reveal, GSAP, navigation, cursor effects, and form state in the browser.

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

Turnstile is optional. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` together, add a Turnstile widget/token to the form when enabling it, and register the deployed hostname in Cloudflare. Partial email or Turnstile configuration fails clearly. Server verification is enforced whenever the key pair is present.

## Personalization

- Edit names, URLs, public email, site origin, and navigation in `src/config/site.ts`.
- Add verified project records in `src/features/projects/projects.data.ts`.
- Add published posts in `src/features/blog/blog.data.ts`; drafts are filtered out.
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
