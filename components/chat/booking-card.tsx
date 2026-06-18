import { ArrowUpRight, Clock } from 'lucide-react'
import { company } from '@/lib/data/company'

export function BookingCard() {
  return (
    <div className="mt-2 rounded-xl border border-(--color-border-strong) bg-(--color-bg-card-alt) p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
        Free audit
      </p>
      <p className="mt-1 text-sm font-semibold text-(--color-text-primary)">
        30-min strategy call
      </p>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-(--color-text-muted)">
        <Clock className="h-3 w-3" />
        <span>Recap + punch list within 24h</span>
      </div>
      <a
        href={company.calUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Book free audit
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}
