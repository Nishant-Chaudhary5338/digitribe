/**
 * Positioning Generator — Output Contract + input. Canonical PRD:
 * docs/store/segment-6-conversion/positioning-generator.md.
 * One symmetric dual-angle artifact (DTC angle + SaaS angle) + a lead-with rec.
 */
import { z } from 'zod'

export const PositioningInput = z.object({ product: z.string().min(1).max(600) })
export type PositioningInput = z.infer<typeof PositioningInput>

const Angle = z.object({
  audience: z.enum(['dtc', 'saas']),
  valueProp: z.string(),
  headlines: z.array(z.string()).min(3).max(6),
  icp: z.string(),
  messageHierarchy: z.array(z.string()).min(3).max(7),
})

export const PositioningOutput = z.object({
  product: z.string(),
  category: z.string(),
  angles: z.array(Angle).length(2),
  recommendation: z.object({ leadWith: z.enum(['dtc', 'saas']), why: z.string() }),
})
export type PositioningOutput = z.infer<typeof PositioningOutput>
