# Avatar assets

The portfolio works without personal media and shows an abstract SVG silhouette. To enable layered personal visuals, add:

- `portrait-real.webp`
- `avatar-cartoon-no-hood.webp`
- `avatar-cartoon-hood.webp`
- `avatar-blink.webp`
- `avatar-transition.webm` (optional)
- `hoodie-transition.webm` (optional)

Use consistent 4:5 artwork, ideally 1600 × 2000 px. WebP images should share alignment and use transparency where possible; videos should be short, muted, loop-safe WebM files with matching framing. Update `AvatarScene` to render the supplied layers with `next/image`; never commit a substitute person’s portrait.
