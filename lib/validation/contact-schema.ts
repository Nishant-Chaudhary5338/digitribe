import { z } from 'zod'
import { emailField, nameField } from './shared'

export const contactSchema = z.object({
  name: nameField,
  email: emailField,
  company: z.string().min(2, 'Company name is required').max(100),
  websiteUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  needs: z
    .array(
      z.enum([
        'new-website',
        'site-rebuild',
        'shopify',
        'web-app',
        'meta-ads',
        'google-ads',
        'seo-audit',
        'content',
        'package',
        'unsure',
      ])
    )
    .min(1, 'Please select at least one'),
  budget: z.enum(['under-3k', '3k-7k', '7k-15k', '15k-plus', 'monthly-retainer']),
  timeline: z.enum(['yesterday', '30d', '60d', 'exploring']),
  notes: z.string().max(2000).optional(),
  // Honeypot -- must be empty
  company_url: z.string().max(0).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
