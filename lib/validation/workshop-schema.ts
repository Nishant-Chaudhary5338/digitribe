import { z } from 'zod'
import { emailField } from './shared'

export const workshopInterestSchema = z.object({
  email: emailField,
  company_url: z.string().max(0).optional(), // honeypot
})

export type WorkshopInterestInput = z.infer<typeof workshopInterestSchema>
