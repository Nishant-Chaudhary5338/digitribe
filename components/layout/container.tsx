import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type ContainerTag = 'div' | 'section' | 'article' | 'main' | 'aside' | 'nav' | 'header' | 'footer'

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: ContainerTag
  children: React.ReactNode
}

export function Container({
  as: Tag = 'div',
  children,
  className,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn('max-w-7xl mx-auto px-5 sm:px-8 lg:px-12', className)}
      {...props}
    >
      {children}
    </Tag>
  )
}
