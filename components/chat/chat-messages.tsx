'use client'

import { useEffect, useRef } from 'react'
import type { UIMessage } from 'ai'
import { BookingCard } from './booking-card'

const BOOKING_SIGNAL = '[BOOKING_CARD]'

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('')
}

function BotAvatar() {
  return (
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-accent) text-[10px] font-bold text-white">
      D
    </span>
  )
}

function MessageBubble({ message, isStreaming }: { message: UIMessage; isStreaming: boolean }) {
  const isUser = message.role === 'user'
  const rawText = getTextFromMessage(message)

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-(--color-accent) px-3.5 py-2.5 text-sm text-white">
          {rawText}
        </div>
      </div>
    )
  }

  const hasBookingCard = rawText.includes(BOOKING_SIGNAL)
  const text = rawText.replace(BOOKING_SIGNAL, '').trim()

  return (
    <div className="flex items-start gap-2">
      <BotAvatar />
      <div className="flex-1">
        {text && (
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-(--color-bg-card-alt) px-3.5 py-2.5 text-sm text-(--color-text-body)">
            {text}
            {isStreaming && (
              <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-current opacity-60" />
            )}
          </div>
        )}
        {hasBookingCard && <BookingCard />}
      </div>
    </div>
  )
}

function ThinkingDots() {
  return (
    <div className="flex items-start gap-2">
      <BotAvatar />
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-(--color-bg-card-alt) px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-(--color-text-muted) opacity-60"
            style={{ animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out` }}
          />
        ))}
      </div>
    </div>
  )
}

type Props = {
  messages: UIMessage[]
  isLoading: boolean
  isWaiting: boolean
}

export function ChatMessages({ messages, isLoading, isWaiting }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, isWaiting])

  const visibleMessages = messages.filter((m) => m.role === 'user' || m.role === 'assistant')
  const lastMsg = visibleMessages[visibleMessages.length - 1]

  if (visibleMessages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-accent) text-xl font-bold text-white">
          D
        </span>
        <div>
          <p className="text-sm font-semibold text-(--color-text-primary)">
            Hey, I&apos;m Digibot
          </p>
          <p className="mt-1 text-xs text-(--color-text-muted)">
            Ask me about services, pricing, or book a free audit.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {visibleMessages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          isStreaming={isLoading && m.id === lastMsg?.id && m.role === 'assistant'}
        />
      ))}
      {isWaiting && <ThinkingDots />}
      <div ref={bottomRef} />
    </div>
  )
}
