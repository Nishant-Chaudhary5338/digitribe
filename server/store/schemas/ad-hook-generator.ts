/**
 * Ad Hook Generator — Output Contract + input. Canonical PRD:
 * docs/store/segment-6-conversion/ad-hook-generator.md.
 * 20 scroll-stopping hooks across >=5 distinct angles, channel-native, DTC/SaaS aware.
 */
import { z } from 'zod'

export const CHANNELS = ['meta', 'google', 'tiktok', 'linkedin'] as const

export const AdHookInput = z.object({
  product: z.string().min(1).max(600),
  offer: z.string().max(200).optional(),
  channel: z.enum(CHANNELS).default('meta'),
  audience: z.enum(['dtc', 'saas', 'unknown']).default('unknown'),
})
export type AdHookInput = z.infer<typeof AdHookInput>

const Hook = z.object({
  angle: z.string(),
  hook: z.string().max(200),
})

export const AdHookOutput = z.object({
  channel: z.enum(CHANNELS),
  hooks: z.array(Hook).length(20),
  anglesCovered: z.array(z.string()).min(5),
})
export type AdHookOutput = z.infer<typeof AdHookOutput>
