/**
 * Deterministic AiRunner mock for pipeline tests (doc 05 §2.1). No network.
 * Pass the object the AI "returns"; it's validated against the product's schema
 * (so a fixture that violates the Output Contract throws — exactly like prod).
 */
import type { AiRunner } from '../../../lib/store/types'
import { storeError } from '../../../lib/store/errors'

export function mockAi(responses: { structured?: unknown; ping?: boolean }): AiRunner {
  return {
    async structured(opts) {
      return opts.schema.parse(responses.structured)
    },
    async structuredStream(opts) {
      opts.onPartial({})
      const value = opts.schema.parse(responses.structured)
      opts.onPartial(value)
      return value
    },
    async ping() {
      if (responses.ping === false) throw storeError('KEY_INVALID', 'invalid key')
    },
  }
}
