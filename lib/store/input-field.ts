/**
 * Derive a product's input fields from its Zod input schema, so the tool UI
 * renders the right form without per-product config. Canonical: doc 06.
 */
export interface InputField {
  key: string
  label: string
  type: 'url' | 'text'
  required: boolean
}

function humanize(k: string): string {
  return k
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase())
}

function isOptional(def: unknown): boolean {
  const f = def as { isOptional?: () => boolean } | null
  try {
    return typeof f?.isOptional === 'function' ? f.isOptional() : false
  } catch {
    return false
  }
}

/** All input fields (required first). Falls back to a single text field. */
export function inputFields(schema: unknown): InputField[] {
  const shape = (schema as { shape?: Record<string, unknown> } | null)?.shape
  if (!shape) return [{ key: 'input', label: 'Input', type: 'text', required: true }]
  const fields = Object.entries(shape).map(([key, def]) => ({
    key,
    label: humanize(key),
    type: /url/i.test(key) ? ('url' as const) : ('text' as const),
    required: !isOptional(def),
  }))
  return [...fields].sort((a, b) => Number(b.required) - Number(a.required))
}

/** The product's primary (first, required) input field. */
export function primaryInputField(schema: unknown): InputField {
  return inputFields(schema)[0] ?? { key: 'input', label: 'Input', type: 'text', required: true }
}
