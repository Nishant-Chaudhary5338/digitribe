/**
 * Parse-validation for generated files. Closes the "must parse" promise the
 * file-producing products make (Pass-7 MEDIUM) — a deterministic check that
 * runs in CI without an AI key. The runner calls this before persisting so a
 * broken bundle never reaches the buyer (and quota isn't spent).
 */
export interface GeneratedFileLike {
  path: string
  language?: string
  contents: string
}

export interface FileValidation {
  ok: boolean
  issues: Array<{ path: string; error: string }>
}

export function validateFiles(files: GeneratedFileLike[]): FileValidation {
  const issues: Array<{ path: string; error: string }> = []
  for (const f of files) {
    if (typeof f.contents !== 'string' || f.contents.trim() === '') {
      issues.push({ path: f.path, error: 'empty file' })
      continue
    }
    if (f.language === 'json') {
      try {
        JSON.parse(f.contents)
      } catch {
        // Allow JSONL (one JSON object per line) too.
        const lines = f.contents.split('\n').filter((l) => l.trim())
        const allLinesValid =
          lines.length > 0 &&
          lines.every((l) => {
            try {
              JSON.parse(l)
              return true
            } catch {
              return false
            }
          })
        if (!allLinesValid) issues.push({ path: f.path, error: 'invalid JSON' })
      }
    }
  }
  return { ok: issues.length === 0, issues }
}

/** Extract a files[] array from an arbitrary artifact (or []). */
export function filesOf(artifact: unknown): GeneratedFileLike[] {
  if (
    artifact &&
    typeof artifact === 'object' &&
    Array.isArray((artifact as { files?: unknown }).files)
  ) {
    return (artifact as { files: unknown[] }).files.filter(
      (f): f is GeneratedFileLike =>
        !!f &&
        typeof f === 'object' &&
        typeof (f as GeneratedFileLike).path === 'string' &&
        typeof (f as GeneratedFileLike).contents === 'string'
    )
  }
  return []
}
