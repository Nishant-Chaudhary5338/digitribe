/**
 * Agent-Ready Kit pipeline. Canonical: PRD §7, §9.
 * crawl -> score (deterministic) -> AI fills the bundle -> force the computed
 * scores back over the AI's (the model writes prose; we own the numbers).
 */
import type { ProductPipeline } from '../../../lib/store/types'
import { runEvent } from '../../../lib/store/events'
import {
  AgentReadyOutput,
  gradeFor,
  type AgentReadyInput,
  type AgentReadyOutput as Out,
} from '../schemas/agent-ready-kit'
import { crawlSite } from './agentic/crawl'
import { scoreReadiness } from './agentic/score'
import { AGENT_READY_SYSTEM, buildPrompt } from '../prompts/agent-ready-kit'

export const agentReadyPipeline: ProductPipeline<AgentReadyInput, Out> = async ({
  input,
  ai,
  emit,
}) => {
  emit(runEvent('crawl', 20, 'Reading your site…'))
  const digest = await crawlSite(input.url, { maxPages: input.maxPages })

  emit(runEvent('analyze', 60, 'Scoring agent-readiness…'))
  const base = scoreReadiness(digest)

  emit(runEvent('generate', 75, 'Generating your bundle…'))
  const out = await ai.structured({
    system: AGENT_READY_SYSTEM,
    prompt: buildPrompt(digest, base, input.businessContext),
    schema: AgentReadyOutput,
    effort: 'high',
  })

  // Deterministic, honest scores override whatever the model returned.
  const byKey = new Map(base.dimensions.map((d) => [d.key, d]))
  return {
    ...out,
    site: { ...out.site, pagesCrawled: digest.pagesCrawled },
    overallScore: base.overallScore,
    grade: gradeFor(base.overallScore),
    dimensions: out.dimensions.map((d) => {
      const b = byKey.get(d.key)
      return b ? { ...d, score: b.score, status: b.status } : d
    }),
  }
}
