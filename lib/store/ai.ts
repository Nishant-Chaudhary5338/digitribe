/**
 * BYOK AI runner — the ONLY way products call AI. Canonical: contracts §7.
 * Built on the Vercel AI SDK (v6); the provider is constructed per-run from the
 * buyer's own key. Structured output is schema-enforced via generateObject.
 *
 * Never log the apiKey, prompts with secrets, or full responses. Errors are
 * mapped to StoreErr with the key redacted.
 */
import { generateObject, streamObject, generateText, type LanguageModel } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { AiProvider, AiRunner } from './types'
import { StoreErr, type StoreErrorCode } from './errors'
import { redactKey } from './byok'

/** Fallback model per provider when a product doesn't pass an explicit one.
 *  Products SHOULD pass `model` (from ProductDef.defaultModel); these are best-effort. */
/** Only Anthropic has a verified default. We never hardcode possibly-stale
 *  OpenAI/Google model ids — products MUST pass an explicit model for those. */
const DEFAULT_MODEL: Partial<Record<AiProvider, string>> = {
  anthropic: 'claude-opus-4-8',
}

function resolveModel(provider: AiProvider, apiKey: string, modelId?: string): LanguageModel {
  const id = modelId ?? DEFAULT_MODEL[provider]
  if (!id)
    throw new StoreErr({
      code: 'INPUT_INVALID',
      userMessage: `Choose a ${provider} model to use.`,
      retryable: false,
      quotaSpent: false,
    })
  switch (provider) {
    case 'anthropic':
      return createAnthropic({ apiKey })(id)
    case 'openai':
      return createOpenAI({ apiKey })(id)
    case 'google':
      return createGoogleGenerativeAI({ apiKey })(id)
  }
}

function statusOf(e: unknown): number | undefined {
  if (typeof e === 'object' && e !== null) {
    const o = e as Record<string, unknown>
    const s = o.statusCode ?? o.status
    if (typeof s === 'number') return s
  }
  return undefined
}

/** Map a provider/SDK error to a StoreErr with the key redacted. */
function mapError(e: unknown, apiKey: string): StoreErr {
  if (e instanceof StoreErr) return e // already meaningful (e.g. resolveModel INPUT_INVALID)
  const status = statusOf(e)
  const raw = e instanceof Error ? e.message : String(e)
  const detail = redactKey(raw, apiKey)
  let code: StoreErrorCode = 'PROVIDER_ERROR'
  let userMessage = 'Your AI provider hit an error. Try again shortly.'
  let retryable = true

  if (status === 401 || status === 403) {
    code = 'KEY_INVALID'
    userMessage = "That API key didn't work — check it's active and try again. We never store it."
    retryable = false
  } else if (status === 429) {
    code = 'KEY_RATE_LIMITED'
    userMessage =
      'Your provider is rate-limited right now. Wait a moment and re-run — your purchase is safe.'
  } else if (/timeout|timed out|etimedout/i.test(raw)) {
    code = 'PROVIDER_TIMEOUT'
    userMessage = "Your AI provider took too long. We've restored this run — try again."
  } else if (/refus|content.?filter|safety/i.test(raw)) {
    code = 'KEY_REFUSED'
    userMessage =
      'Your AI provider declined this request. Try again, or use a different provider key.'
    retryable = false
  }
  return new StoreErr({ code, userMessage, retryable, quotaSpent: false, detail })
}

export function makeAiRunner(provider: AiProvider, apiKey: string): AiRunner {
  return {
    async structured(opts) {
      try {
        const { object } = await generateObject({
          model: resolveModel(provider, apiKey, opts.model),
          schema: opts.schema,
          system: opts.system,
          prompt: opts.prompt,
          maxOutputTokens: opts.maxOutputTokens ?? 16000,
        })
        return object
      } catch (e) {
        throw mapError(e, apiKey)
      }
    },

    async structuredStream(opts) {
      try {
        const result = streamObject({
          model: resolveModel(provider, apiKey, opts.model),
          schema: opts.schema,
          system: opts.system,
          prompt: opts.prompt,
          maxOutputTokens: opts.maxOutputTokens ?? 16000,
        })
        for await (const partial of result.partialObjectStream) {
          opts.onPartial(partial as Parameters<typeof opts.onPartial>[0])
        }
        return await result.object
      } catch (e) {
        throw mapError(e, apiKey)
      }
    },

    async ping(model) {
      // Throws a mapped StoreErr on failure (KEY_INVALID vs PROVIDER_TIMEOUT vs …)
      // so callers can distinguish an invalid key from a transient provider error.
      try {
        await generateText({
          model: resolveModel(provider, apiKey, model),
          prompt: 'ping',
          maxOutputTokens: 1,
        })
      } catch (e) {
        throw mapError(e, apiKey)
      }
    },
  }
}

/** Pre-charge key validation (contracts §5). Used by /key-check and the runner. */
export async function validateKey(
  provider: AiProvider,
  apiKey: string,
  model?: string
): Promise<boolean> {
  try {
    await makeAiRunner(provider, apiKey).ping(model)
    return true
  } catch (e) {
    if (
      e instanceof StoreErr &&
      (e.payload.code === 'KEY_INVALID' || e.payload.code === 'KEY_REFUSED')
    )
      return false
    throw e // surface PROVIDER_TIMEOUT / PROVIDER_ERROR to the caller
  }
}
