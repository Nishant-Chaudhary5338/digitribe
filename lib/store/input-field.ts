/**
 * Derive the primary input field of a product from its Zod input schema, so the
 * tool UI renders the right field without per-product config. v1 wires the first
 * field (covers the single-primary-field products); multi-field forms are a
 * follow-up. Canonical: doc 06 (schema-driven input).
 */
export interface InputField {
  key: string
  label: string
  type: 'url' | 'text'
}

function humanize(k: string): string {
  return k
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase())
}

export function primaryInputField(schema: unknown): InputField {
  const shape = (schema as { shape?: Record<string, unknown> } | null)?.shape
  const key = shape ? Object.keys(shape)[0] : undefined
  if (!key) return { key: 'input', label: 'Input', type: 'text' }
  return { key, label: humanize(key), type: /url/i.test(key) ? 'url' : 'text' }
}
