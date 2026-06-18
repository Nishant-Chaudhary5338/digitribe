import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai'
import type { UIMessage } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { NextRequest } from 'next/server'
import { systemPrompt } from '@/lib/chat/system-prompt'
import { saveChatLead } from '@/lib/chat/leads'

export const runtime = 'nodejs'
export const maxDuration = 30

const leadSchema = z.object({
  name: z.string().optional().describe("Visitor's name"),
  email: z.string().optional().describe("Visitor's email address"),
  company: z.string().optional().describe('Company or project name'),
  need: z.string().optional().describe('What they are looking for'),
  budget: z.string().optional().describe('Rough budget range they mentioned'),
})

type LeadInput = z.infer<typeof leadSchema>

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { messages: UIMessage[]; id?: string }
  const sessionId = body.id ?? 'unknown'
  const modelMessages = await convertToModelMessages(body.messages)

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: modelMessages,
    tools: {
      saveLead: tool<LeadInput, { saved: boolean }>({
        description:
          'Save a qualified lead to the database and notify the Digitribe team. Call this as soon as you have collected what they need + at least one of (company, email, or name).',
        inputSchema: leadSchema,
        execute: async (lead) => {
          await saveChatLead({
            ...lead,
            sessionId,
            capturedAt: new Date().toISOString(),
          })
          return { saved: true }
        },
      }),
    },
    stopWhen: stepCountIs(5),
  })

  return result.toUIMessageStreamResponse()
}
