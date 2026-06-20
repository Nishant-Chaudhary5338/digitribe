/**
 * MCP Hardening Kit — Output Contract + input. Canonical PRD:
 * docs/store/segment-3-mcp-security/mcp-hardening-kit.md.
 */
import { z } from 'zod'

export const McpHardeningInput = z.object({
  framework: z.string().min(1).max(100),
  description: z.string().min(1).max(4000),
})
export type McpHardeningInput = z.infer<typeof McpHardeningInput>

const GeneratedFile = z.object({
  path: z.string(),
  language: z.enum(['typescript', 'javascript', 'python', 'markdown']),
  contents: z.string(),
})

const ScopeChange = z.object({
  tool: z.string(),
  from: z.string(),
  to: z.string(),
  reason: z.string(),
})

export const McpHardeningOutput = z.object({
  summary: z.string().max(400),
  files: z.array(GeneratedFile).min(1),
  scopeChanges: z.array(ScopeChange).max(20),
  checklist: z.array(z.string()).min(3).max(15),
})
export type McpHardeningOutput = z.infer<typeof McpHardeningOutput>
