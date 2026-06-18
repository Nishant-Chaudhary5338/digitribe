'use client'

import Link from 'next/link'

type ErrorPageProps = {
  error: Error
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#0a0e27] px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-[#ff5b3a] mb-6">
        Error
      </p>
      <h1 className="text-4xl font-bold text-white mb-4 font-display">
        Something broke.
      </h1>
      <p className="text-base text-white/50 mb-3 max-w-sm">
        We tracked the issue. Give it another shot or head home.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <p className="text-xs text-white/30 mb-10 max-w-sm font-mono break-all">
          {error.message}
        </p>
      )}
      <div className="flex flex-col gap-4 sm:flex-row mt-6">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-[#ff5b3a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ff7556]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
