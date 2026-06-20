/**
 * Scan My MCP Server — Output Contract + input. Canonical PRD:
 * docs/store/segment-3-mcp-security/scan-my-mcp.md.
 * v1: static analysis over a pasted MCP config / tool manifest (a live-server
 * connection is a documented v2 enhancement, see the PRD).
 */
import { z } from 'zod'

export const ScanMcpInput = z.object({
  config: z.string().min(1).max(8000),
})
export type ScanMcpInput = z.infer<typeof ScanMcpInput>

export const THREAT_CLASSES = [
  'prompt_injection',
  'tool_poisoning',
  'over_privilege',
  'missing_auth',
  'path_traversal',
  'confused_deputy',
  'unsafe_tool_call',
  'data_exfiltration',
  'rug_pull',
] as const

const Finding = z.object({
  threatClass: z.enum(THREAT_CLASSES),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  title: z.string(),
  evidence: z.string(),
  exploit: z.string().optional(),
  fix: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
})

export const ScanMcpOutput = z.object({
  postureScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  toolsFound: z.array(z.string()).max(50),
  findings: z.array(Finding),
  topActions: z.array(z.string()).min(3).max(5),
})
export type ScanMcpOutput = z.infer<typeof ScanMcpOutput>
