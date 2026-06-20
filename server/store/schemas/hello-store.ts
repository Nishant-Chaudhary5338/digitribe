/**
 * Demo product "Hello Store" — the spine's end-to-end acceptance test (segment-0 S12).
 * Smallest possible BYOK-finite product: text in -> restyled text out.
 */
import { z } from 'zod'

export const HelloStoreInput = z.object({
  text: z.string().min(1, 'Enter some text.').max(500),
})
export type HelloStoreInput = z.infer<typeof HelloStoreInput>

export const HelloStoreOutput = z.object({
  original: z.string(),
  restyled: z.string().describe('the text rewritten in a confident, senior brand voice'),
  tone: z.string().describe('one or two words describing the original tone'),
  wordCount: z.number().int().describe('word count of the original text'),
})
export type HelloStoreOutput = z.infer<typeof HelloStoreOutput>
