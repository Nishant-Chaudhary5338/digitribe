'use client'

import { Send } from 'lucide-react'
import { useState, useRef } from 'react'

type Props = {
  isLoading: boolean
  onSend: (text: string) => void
}

export function ChatInput({ isLoading, onSend }: Props) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function submit() {
    const text = input.trim()
    if (!text || isLoading) return
    onSend(text)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-(--color-border) bg-(--color-bg-card) p-3">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything…"
        rows={1}
        disabled={isLoading}
        className="min-h-9 flex-1 resize-none rounded-lg bg-(--color-bg-page) px-3 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none disabled:opacity-50"
        style={{ lineHeight: '1.5' }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={!input.trim() || isLoading}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-accent) text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  )
}
