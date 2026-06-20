/**
 * DTC Email-Flow Generator — Output Contract + input. Canonical PRD:
 * docs/store/segment-6-conversion/dtc-email-flows.md.
 * Welcome + abandoned-cart sequences, platform-agnostic plain copy.
 */
import { z } from 'zod'

export const DtcEmailInput = z.object({
  brand: z.string().min(1).max(200),
  product: z.string().min(1).max(500),
  tone: z.string().max(100).optional(),
})
export type DtcEmailInput = z.infer<typeof DtcEmailInput>

const Email = z.object({
  subject: z.string(),
  preview: z.string(),
  delayHours: z.number().int().min(0),
  goal: z.string(),
  body: z.string(),
})

const Sequence = z.object({
  name: z.enum(['welcome', 'abandoned_cart']),
  emails: z.array(Email).min(2).max(6),
})

export const DtcEmailOutput = z.object({
  sequences: z.array(Sequence).length(2),
  subjectLineBank: z.array(z.string()).min(5).max(20),
})
export type DtcEmailOutput = z.infer<typeof DtcEmailOutput>
