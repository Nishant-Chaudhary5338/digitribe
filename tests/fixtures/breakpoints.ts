export const BREAKPOINTS = [
  { name: 'mobile-xs', width: 320, height: 640 },
  { name: 'mobile-sm', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1920, height: 1080 },
] as const

export type Breakpoint = (typeof BREAKPOINTS)[number]
