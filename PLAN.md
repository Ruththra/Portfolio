# Portfolio implementation plan

## Architecture

- Next.js App Router with server-rendered routes and metadata.
- Typed configuration and content in `src/config` and `src/data`.
- Server Components by default; focused Client Components for navigation, GSAP, and the form.
- Contact API validates with a shared Zod schema, optionally verifies Turnstile, and sends via Resend.
- CSS variables and Tailwind utilities provide the visual system.

## Phases

- [x] Inspect repository and attached files.
- [x] Define architecture, conventions, dependencies, and asset strategy.
- [x] Build the data/configuration layer and shared UI.
- [x] Build homepage, archive pages, detail pages, metadata, and API.
- [x] Add responsive behavior, accessibility, and motion.
- [x] Add tests, CI, and documentation.
- [x] Run formatting, lint, typecheck, unit tests, build, and browser tests where supported.

## Required assets

No personal images, avatar transitions, social URLs, contact address, résumé, project media, or published writing were supplied. The UI uses an abstract, non-human celestial silhouette and honest empty states. Replacement contracts are documented in `public/media/avatar/README.md` and `public/resume/README.md`.

## Risks

- Browser binaries may not be installed for Playwright.
- Email delivery and Turnstile require deployment secrets.
- Final visual fidelity to personal likeness depends on user-supplied avatar assets.

## Testing strategy

- Vitest/RTL for configuration, schema, typing behavior, mobile navigation, and content helpers.
- Playwright smoke tests for routes, anchors, mobile navigation, validation, and reduced motion.
- ESLint, strict TypeScript, Prettier, and production build in local validation and CI.

## Completion checklist

- [x] All routes and homepage sections
- [x] Accessible responsive navigation and forms
- [x] GSAP desktop sequence with reduced-motion/mobile alternatives
- [x] Data-driven projects, blogs, journey, and skills
- [x] Contact delivery behavior
- [x] SEO, sitemap, robots, icon, structured data
- [x] Tests and GitHub Actions
- [x] Complete documentation
- [x] Required static checks and build passing; browser smoke tests are configured but browser binaries are unavailable in this environment
