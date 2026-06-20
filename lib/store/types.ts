/**
 * Shared domain types for the store. Canonical source: docs/store/04-implementation-contracts.md.
 * Do not redefine these per product — import from here.
 */
import type { z } from 'zod'

export type AiProvider = 'anthropic' | 'openai' | 'google'
export type ProductModel = 'byok-finite'
export type Segment = 1 | 2 | 3 | 4 | 5 | 6
export type ProductStatus = 'draft' | 'beta' | 'live'

/** How a purchase is fulfilled (contracts §6). */
export type Delivery = 'in-browser' | 'download-license'

export interface ProductDef {
  slug: string
  name: string
  segment: Segment
  tagline: string
  /** DISPLAY ONLY — charge from Polar (platform-spec §3). */
  priceUSD: number
  polarProductId: string
  model: ProductModel
  delivery: Delivery
  byokProviders: AiProvider[]
  /** e.g. { anthropic: 'claude-opus-4-8' } */
  defaultModel: Partial<Record<AiProvider, string>>
  estRunSeconds: number
  /** Quota; default 3. Ignored for `download-license` products. */
  runsPerPurchase: number
  status: ProductStatus
  // Wired lazily to avoid circular imports between registry and product modules:
  inputSchema: () => Promise<z.ZodTypeAny>
  outputSchema: () => Promise<z.ZodTypeAny>
  pipeline: () => Promise<ProductPipeline<unknown, unknown>>
}

/** A product's pipeline. Pure-ish: (input, ai, emit) -> contract. No global state. */
export type ProductPipeline<I, O> = (ctx: {
  input: I
  ai: AiRunner
  emit: (e: RunEvent) => void
  signal: AbortSignal
}) => Promise<O>

// ── Access tokens (in-browser products) ────────────────────────────────────

export interface AccessTokenPayload {
  /** token id (KV key suffix) */
  jti: string
  purchaseId: string
  slug: string
  email: string
  /** issued-at (epoch seconds) */
  iat: number
  /** iat + 30d */
  exp: number
}

// ── Run events (SSE) ───────────────────────────────────────────────────────

export type RunPhase =
  | 'auth'
  | 'validate'
  | 'key'
  | 'crawl'
  | 'analyze'
  | 'generate'
  | 'render'
  | 'persist'
  | 'done'
  | 'error'

export interface RunEvent {
  phase: RunPhase
  /** 0–100, monotonic */
  pct: number
  /** human label shown in UI ("Crawling 12/20…") */
  message: string
  /** optional streamed slice of the Output Contract */
  partial?: unknown
  /** optional "show the work" counter (doc 03 §3) */
  findingCount?: number
}

// ── Run request / result ───────────────────────────────────────────────────

export interface RunRequest<I = unknown> {
  token: string
  byokKey: string
  input: I
  /** client-generated uuid v4 for idempotency */
  runId?: string
}

export interface RunResult {
  runId: string
  slug: string
  status: 'success' | 'error'
  artifactUrl?: string
  finishedAt: number
  /** jti of the access token that produced this run — gates artifact access */
  ownerJti: string
}

// ── Licensing (Segment 5 downloadable apps) ────────────────────────────────

export interface License {
  /** shown to buyer; persist a hash, not the raw key */
  key: string
  purchaseId: string
  slug: string
  email: string
  maxActivations: number
  revoked: boolean
  createdAt: number
}

export interface Activation {
  licenseKey: string
  deviceId: string
  activatedAt: number
}

// ── AI runner (BYOK wrapper) — interface only; impl in ai.ts (contracts §7) ──

export interface AiImagePart {
  mediaType: string
  data: string | URL
}

export interface AiRunner {
  /** Structured, schema-enforced generation. Throws StoreErr on key/provider issues. */
  structured<T>(opts: {
    system: string
    prompt: string
    schema: z.ZodSchema<T>
    effort?: 'low' | 'medium' | 'high'
    model?: string
    maxOutputTokens?: number
    /** optional multimodal input (SW-6) — requires a vision-capable model */
    images?: AiImagePart[]
  }): Promise<T>

  /** Same, but streams partial objects for progressive UI (doc 03 §3). */
  structuredStream<T>(opts: {
    system: string
    prompt: string
    schema: z.ZodSchema<T>
    effort?: 'low' | 'medium' | 'high'
    model?: string
    maxOutputTokens?: number
    images?: AiImagePart[]
    onPartial: (p: Partial<T>) => void
  }): Promise<T>

  /** 1-token liveness check. Resolves if the key works; throws a mapped StoreErr
   *  (KEY_INVALID / PROVIDER_TIMEOUT / …) otherwise, so callers can distinguish. */
  ping(model?: string): Promise<void>
}
