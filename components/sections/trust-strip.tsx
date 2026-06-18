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
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-12">
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--color-text-on-inverse)', opacity: 0.7 }}
        >
          &mdash; 2 specialists. Zero account managers. Direct contact with the people doing the
          work. &mdash;
        </p>
      </div>
    </section>
  )
}
