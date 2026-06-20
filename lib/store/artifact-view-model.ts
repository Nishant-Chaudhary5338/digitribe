/**
 * Generic artifact -> view-model. A single pure function that detects the shapes
 * the store's products share (score/grade, dimensions, generated files, string
 * lists) so ONE renderer can display every product's output. Canonical: doc 06.
 */
export interface VmDimension {
  key: string
  label?: string
  score?: number
  status?: string
  findings?: string[]
}
export interface VmFile {
  path: string
  contents: string
}
export interface VmList {
  title: string
  items: string[]
}
export interface ArtifactViewModel {
  headline?: string
  score?: number
  grade?: string
  dimensions: VmDimension[]
  files: VmFile[]
  lists: VmList[]
  raw: unknown
}

const SCORE_KEYS = ['overallScore', 'score', 'postureScore']
const LIST_KEYS: Record<string, string> = {
  topActions: 'Top actions',
  checklist: 'Checklist',
  coveredInvariants: 'Covered invariants',
  trustRecommendations: 'Trust recommendations',
  anglesCovered: 'Angles covered',
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function asStringArray(v: unknown): string[] | undefined {
  return Array.isArray(v) && v.every((x) => typeof x === 'string') ? (v as string[]) : undefined
}

export function toViewModel(artifact: unknown): ArtifactViewModel {
  const vm: ArtifactViewModel = { dimensions: [], files: [], lists: [], raw: artifact }
  if (!isRecord(artifact)) return vm

  for (const k of SCORE_KEYS) {
    if (typeof artifact[k] === 'number') {
      vm.score = artifact[k] as number
      break
    }
  }
  if (typeof artifact['grade'] === 'string') vm.grade = artifact['grade']
  if (typeof artifact['summary'] === 'string') vm.headline = artifact['summary']

  if (Array.isArray(artifact['dimensions'])) {
    vm.dimensions = (artifact['dimensions'] as unknown[]).filter(isRecord).map((d) => ({
      key: String(d['key'] ?? ''),
      label: typeof d['label'] === 'string' ? d['label'] : undefined,
      score: typeof d['score'] === 'number' ? d['score'] : undefined,
      status: typeof d['status'] === 'string' ? d['status'] : undefined,
      findings: asStringArray(d['findings']),
    }))
  }

  if (Array.isArray(artifact['files'])) {
    vm.files = (artifact['files'] as unknown[])
      .filter(isRecord)
      .filter((f) => typeof f['path'] === 'string' && typeof f['contents'] === 'string')
      .map((f) => ({ path: f['path'] as string, contents: f['contents'] as string }))
  }

  for (const [key, title] of Object.entries(LIST_KEYS)) {
    const items = asStringArray(artifact[key])
    if (items && items.length) vm.lists.push({ title, items })
  }

  return vm
}
