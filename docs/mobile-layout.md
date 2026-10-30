# Mobile layout

Mobile adjustments apply at widths up to 767px; desktop layout is preserved.

- Skills glows stay within the section bounds to avoid horizontal overflow.
- Technology groups use one column up to 420px.
- Project and research carousels show one card on mobile and three on desktop.
- Contact inputs use 16px text; footer links have 44px minimum touch targets.
- The navigation overlay scrolls on short landscape screens.
- Floating contact controls respect device safe areas.

Run `corepack pnpm test:e2e e2e/mobile-fit.spec.ts` for touch-device checks at
320px, 390px, 767px, and landscape 667px. To use an already running preview,
set `MOBILE_TEST_URL` to its URL; this skips starting another test server.
