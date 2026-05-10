'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils/cn'

export interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
  disabled?: boolean
}

export function Reveal({
  children,
  delay = 0,
  className,
  disabled = false,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (disabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
