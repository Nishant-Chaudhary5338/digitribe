/**
 * Tool-Permission Auditor — Output Contract + input. Canonical PRD:
 * docs/store/segment-3-mcp-security/tool-permission-auditor.md.
 */
import { z } from 'zod'

export const ToolPermissionInput = z.object({
  config: z.string().min(1).max(8000),
})
export type ToolPermissionInput = z.infer<typeof ToolPermissionInput>

const ScopeFlag = z.object({
  tool: z.string(),
  currentScope: z.string(),
  risk: z.enum(['critical', 'high', 'medium', 'low']),
  recommendedScope: z.string(),
  reason: z.string(),
})

export const ToolPermissionOutput = z.object({
  score: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  summary: z.string().max(400),
  flags: z.array(ScopeFlag),
})
export type ToolPermissionOutput = z.infer<typeof ToolPermissionOutput>
