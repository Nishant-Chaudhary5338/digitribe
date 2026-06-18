export type Testimonial = {
  id: string
  quote: string
  author: string
  role: string
  company: string
  companyUrl?: string
  avatarUrl?: string
}

// Empty for v1 — add real testimonials as they come in
export const testimonials: Testimonial[] = []
