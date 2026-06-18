import { Reveal } from '@/components/primitives/reveal'
import { Container } from '@/components/layout/container'

type Theme = 'studio' | 'garden'

interface ProblemStatementProps {
  theme?: Theme
}

/** DTC "Studio" — a hard, split editorial layout: label rail left, prose right. */
function StudioProblem() {
  return (
    <section
      style={{ background: 'var(--color-bg-card-alt)', paddingBlock: 'var(--space-section-md)' }}
    >
      <Container>
        <Reveal>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[180px_1fr] lg:gap-16">
            <div className="flex flex-row items-start gap-4 lg:flex-col lg:gap-6">
              <span
                className="text-xs uppercase"
                style={{
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: 'var(--tracking-label)',
                  color: 'var(--color-text-muted)',
                }}
              >
                /// the problem
              </span>
              <span
                aria-hidden="true"
                className="hidden lg:block"
                style={{ width: 2, height: 64, background: 'var(--color-accent)' }}
              />
            </div>

            <div style={{ maxWidth: 'var(--measure)' }}>
              <h2
                className="mb-6"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--display-sm)',
                  fontWeight: 800,
                  letterSpacing: 'var(--tracking-display)',
                  lineHeight: 'var(--leading-tight)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Two agencies, one mess.
              </h2>
              <p
                className="mb-8 text-lg leading-relaxed"
                style={{ color: 'var(--color-text-body)' }}
              >
                Your marketing agency makes traffic but can&apos;t touch the site. Your dev shop
                builds the site but never talks to the marketers. Three vendors, three Slack
                channels, zero coordination — and your ad spend lands on pages that don&apos;t
                convert.
              </p>

              <h3 className="mb-4">
                <span
                  className="relative inline-block"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--display-sm)',
                    fontWeight: 800,
                    letterSpacing: 'var(--tracking-display)',
                    lineHeight: 'var(--leading-tight)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0"
                    style={{
                      bottom: 4,
                      height: 14,
                      background: 'var(--color-tertiary)',
                      zIndex: -1,
                    }}
                  />
                  We fixed this by being one team.
                </span>
              </h3>
              <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-body)' }}>
                When Nishant builds the page, Manu is already briefing the creative. When a campaign
                angle works, the landing page reflects it in days. The site and the growth motion
                are never out of sync.
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

/** SaaS "Garden" — editorial: a Fraunces pull-quote, two-column body, italic pivot. */
function GardenProblem() {
  return (
    <section
      style={{ background: 'var(--color-bg-card-alt)', paddingBlock: 'var(--space-section-lg)' }}
    >
      <Container>
        <Reveal>
          <div className="mx-auto" style={{ maxWidth: 'var(--measure)' }}>
            <span
              className="mb-6 block"
              style={{
                fontFamily: 'var(--font-accent)',
                fontStyle: 'italic',
                fontVariationSettings: "'opsz' 24, 'wght' 500",
                fontSize: '1rem',
                color: 'var(--color-text-muted)',
              }}
            >
              — the problem
            </span>
            <p
              className="mb-10"
              style={{
                fontFamily: 'var(--font-display)',
                fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 400",
                fontSize: 'var(--display-md)',
                lineHeight: 1.08,
                letterSpacing: 'var(--tracking-tight)',
                color: 'var(--color-text-primary)',
              }}
            >
              You need a product-grade presence before the raise — and someone who speaks both{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>
                engineering and growth.
              </span>
            </p>

            <div className="mb-10 gap-8 sm:columns-2" style={{ color: 'var(--color-text-body)' }}>
              <p className="mb-4 text-base leading-relaxed">
                Most founders end up stitching a designer, a dev shop, and a marketer together, then
                doing the project management themselves. The site doesn&apos;t match the story the
                marketing tells.
              </p>
              <p className="text-base leading-relaxed">
                The build can&apos;t keep up with the roadmap. Every handoff is a place for the
                message — and the momentum — to leak out.
              </p>
            </div>

            <hr
              style={{
                border: 'none',
                borderTop: '1px solid var(--color-border)',
                margin: '0 0 2.5rem',
              }}
            />

            <p
              className="mb-5"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 500",
                fontSize: 'var(--display-sm)',
                letterSpacing: 'var(--tracking-tight)',
                color: 'var(--color-accent)',
              }}
            >
              So we made it one team.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-body)' }}>
              Engineering, growth, and AI under one roof — senior people who own their lane and talk
              to each other daily. You get a partner, not a vendor stack.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

export function ProblemStatement({ theme = 'studio' }: ProblemStatementProps) {
  return theme === 'garden' ? <GardenProblem /> : <StudioProblem />
}
