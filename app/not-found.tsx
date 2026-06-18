import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#0a0e27] px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-[#ff5b3a] mb-6">
        404
      </p>
      <h1 className="text-4xl font-bold text-white mb-4 font-display">
        Lost in the tribe.
      </h1>
      <p className="text-lg text-white/50 mb-12 max-w-sm">
        That page doesn't exist. Here are a few places that do.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-[#ff5b3a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ff7556]"
        >
          Home
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10"
        >
          Services
        </Link>
        <Link
          href="/audit"
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10"
        >
          Free Audit
        </Link>
      </div>
    </div>
  )
}
