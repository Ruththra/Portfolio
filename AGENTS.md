# Project conventions

## Architecture

- Use App Router and Server Components unless browser APIs, state, or animation require a Client Component.
- Keep editable personal content in `src/config/site.ts` and typed content in `src/data`.
- Keep validation shared between browser and API. Never expose server secrets.
- Optional links and assets must degrade gracefully.

## Code style

- Strict TypeScript; no `any`.
- Components should remain focused, semantic, and reusable.
- Prefer CSS/SVG decoration and `next/image` for supplied raster media.
- Use design tokens from `globals.css`; avoid isolated magic colors.

## Accessibility

- Target WCAG 2.2 AA: logical headings, labels, focus visibility, keyboard support, 44px targets, and reduced motion.
- Decorative elements are hidden from assistive technologies.
- Never make animation the only way to access content.

## Commands

- `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`
- `pnpm test`, `pnpm test:e2e`, `pnpm format:check`

## Definition of done

Changes are responsive, keyboard accessible, typed, documented, and pass formatting, lint, typecheck, unit tests, and production build. Update tests when behavior changes.
