export function TrustStrip() {
  return (
    <section
      className="py-5"
      style={{
        background: 'var(--color-bg-inverse)',
        borderTop: '1px solid var(--color-border-decorative)',
        borderBottom: '1px solid var(--color-border-decorative)',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 text-center">
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--color-text-on-inverse)', opacity: 0.7 }}
        >
          &mdash; 3 specialists. Zero account managers. Direct contact with the people doing the work. &mdash;
        </p>
      </div>
    </section>
  )
}
