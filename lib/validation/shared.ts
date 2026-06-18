import { z } from 'zod'

export const emailField = z.string().email('Please enter a valid email address')
export const nameField = z.string().min(2, 'Please enter your name').max(100)
