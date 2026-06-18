'use client'

import { useRef } from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'

type Props = {
  onClose: () => void
}

export function ChatWindow({ onClose }: Props) {
  const transportRef = useRef(new DefaultChatTransport({ api: '/api/chat' }))

  const { messages, sendMessage, status, id } = useChat({
    transport: transportRef.current,
  })

  const isStreaming = status === 'streaming'
  const isWaiting = status === 'submitted'
  const isLoading = isStreaming || isWaiting

  function handleSend(text: string) {
    void sendMessage({ text })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ type: 'spring', damping: 26, stiffness: 380 }}
      className="flex h-140 w-90 flex-col overflow-hidden rounded-2xl border border-(--color-border-strong) shadow-2xl"
      style={{ background: 'var(--color-bg-card)', backdropFilter: 'blur(20px)' }}
      aria-label="Chat with Digibot"
      role="dialog"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-(--color-border) bg-(--color-bg-card-alt) px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-accent) text-sm font-bold text-white">
          D
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-(--color-text-primary)">Digibot</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-(--color-success)" />
            <p className="text-xs text-(--color-text-muted)">Online</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-(--color-text-muted) transition-colors hover:bg-(--color-bg-page) hover:text-(--color-text-primary)"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ChatMessages messages={messages} isLoading={isStreaming} isWaiting={isWaiting} />

      <ChatInput isLoading={isLoading} onSend={handleSend} />

      {/* suppress unused id warning — id is the session identifier sent with requests */}
      <span data-chat-id={id} className="sr-only" aria-hidden />
    </motion.div>
  )
}
