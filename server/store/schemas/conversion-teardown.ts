/**
 * Conversion Teardown — Output Contract + input. Canonical PRD:
 * docs/store/segment-6-conversion/conversion-teardown.md.
 * A senior CRO teardown of a landing page across 5 fixed dimensions, DTC/SaaS-aware.
 */
import { z } from 'zod'
import { letterGrade } from '../../../lib/store/grade'

export const ConversionTeardownInput = z.object({
  url: z.string().url(),
  audience: z.enum(['dtc', 'saas', 'unknown']).default('unknown'),
  goal: z.string().max(200).optional(),
})
export type ConversionTeardownInput = z.infer<typeof ConversionTeardownInput>

export const CRO_DIMENSION_KEYS = ['above_the_fold', 'clarity', 'friction', 'trust', 'cta'] as const

const Fix = z.object({
  issue: z.string(),
  currentText: z.string().optional(),
  rewrite: z.string(),
})

const CroDimension = z.object({
  key: z.enum(CRO_DIMENSION_KEYS),
  label: z.string(),
  score: z.number().int().min(0).max(100),
  status: z.enum(['weak', 'okay', 'strong']),
  findings: z.array(z.string()).max(8),
  fixes: z.array(Fix).max(6),
})

export const ConversionTeardownOutput = z.object({
  site: z.object({
    url: z.string().url(),
    title: z.string(),
    audience: z.enum(['dtc', 'saas', 'unknown']),
  }),
  overallScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  dimensions: z.array(CroDimension).length(5),
  topActions: z.array(z.string()).min(3).max(5),
})
export type ConversionTeardownOutput = z.infer<typeof ConversionTeardownOutput>

export function croGrade(score: number): ConversionTeardownOutput['grade'] {
  return letterGrade(score)
}
