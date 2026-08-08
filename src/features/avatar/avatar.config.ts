export const avatarAssets = {
  portrait: "/media/avatar/portrait-original.webp",
  transformation: "/media/avatar/avatar-transformation.webm",
} as const;

export const avatarAnimation = {
  desktopQuery: "(min-width: 1200px)",
  reducedMotionQuery: "(prefers-reduced-motion: reduce)",
  loadingDelayMs: 2500,
  videoFrameRate: 24,
  scrollTrigger: {
    id: "hero-avatar-video",
    start: "center center",
    end: "top bottom",
    scrub: 0.6,
    anticipatePin: 1,
  },
  transitionDuration: 0.12,
  videoDuration: 0.88,
} as const;
