/**
 * Agent Prompt-Injection Test Suite — Output Contract + input. Canonical PRD:
 * docs/store/segment-3-mcp-security/agent-injection-suite.md.
 * Generates (never runs) an agent-specific attack corpus + a CI harness.
 */
import { z } from 'zod'

export const AgentInjectionInput = z.object({
  agent: z.string().min(1).max(4000),
  framework: z.enum(['vitest', 'pytest']).default('vitest'),
})
export type AgentInjectionInput = z.infer<typeof AgentInjectionInput>

export const INJECTION_CATEGORIES = [
  'direct_injection',
  'indirect_injection',
  'jailbreak',
  'system_prompt_leak',
  'tool_abuse',
  'data_exfiltration',
  'role_play_escape',
] as const

const TestCase = z.object({
  category: z.enum(INJECTION_CATEGORIES),
  name: z.string(),
  attack: z.string(),
  expectedSafe: z.string(),
})

const GeneratedFile = z.object({
  path: z.string(),
  language: z.enum(['typescript', 'python', 'markdown']),
  contents: z.string(),
})

export const AgentInjectionOutput = z.object({
  summary: z.string().max(400),
  cases: z.array(TestCase).min(7),
  files: z.array(GeneratedFile).min(1),
})
export type AgentInjectionOutput = z.infer<typeof AgentInjectionOutput>
