export type CaseStudy = {
  slug: string
  title: string
  client: string
  category: string
  summary: string
  results: string[]
  heroImageUrl: string
  publishedAt: string
}

// Empty for v1 — add real case studies as they come in
// When ready: create content/case-studies/[slug].mdx and add entries here
export const caseStudies: CaseStudy[] = []
