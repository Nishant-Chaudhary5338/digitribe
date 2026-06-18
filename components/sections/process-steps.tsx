import { Eyebrow } from '@/components/primitives/eyebrow'
import { Headline } from '@/components/primitives/headline'
import { BodyText } from '@/components/primitives/body-text'
import { Reveal } from '@/components/primitives/reveal'
import { Container } from '@/components/layout/container'

interface Step {
  number: string
  title: string
  body: string
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Free audit (30 min)',
    body: "We look at your current site, ad accounts, and funnel. We tell you what we'd change, with no pitch attached.",
  },
  {
    number: '02',
    title: 'Scoped proposal (within 24 hrs)',
    body: "If there's a fit, we send a proposal with deliverables, timeline, milestones, and price. One page, one number, one Loom walkthrough.",
  },
  {
    number: '03',
    title: 'Build and launch (2-8 weeks)',
    body: 'We work in weekly sprints. You see progress every Friday. Nothing ships without your sign-off.',
  },
  {
    number: '04',
    title: 'Optimize (ongoing)',
    body: "Most agencies disappear after launch. We don't. Every Digitribe build comes with 30 days of post-launch optimization based on real user data — included.",
  },
]

export function ProcessSteps() {
  return (
    <section
      id="process"
      style={{
        background: 'var(--color-bg-card-alt)',
        paddingBlock: 'var(--space-section-md)',
      }}
    >
      <Container>
        <Reveal>
          <div className="mb-12 text-center">
            <Eyebrow style={{ color: 'var(--color-text-muted)' }}>Process</Eyebrow>
            <Headline as="h2" className="mt-4" style={{ color: 'var(--color-text-primary)' }}>
              From 'let's talk' to live in 4 weeks.
            </Headline>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.1}>
              <div className="flex flex-col">
                <span
                  className="mb-3 text-[80px] leading-none font-bold select-none lg:text-[96px]"
                  style={{
                    color: 'var(--color-accent)',
                    opacity: 0.22,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {step.number}
                </span>
                <Headline
                  as="h3"
                  className="mb-2 text-lg"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {step.title}
                </Headline>
                <BodyText className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                  {step.body}
                </BodyText>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
