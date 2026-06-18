import { Eyebrow } from '@/components/primitives/eyebrow'
import { Headline } from '@/components/primitives/headline'
import { BodyText } from '@/components/primitives/body-text'
import { Reveal } from '@/components/primitives/reveal'
import { Container } from '@/components/layout/container'

export function ProblemStatement() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ background: 'var(--color-bg-card-alt)' }}>
      <Container>
        <Reveal>
          <div className="mx-auto max-w-3xl">
            <Eyebrow>The problem</Eyebrow>

            <Headline as="h2" className="mt-4 mb-6">
              Two agencies, one mess.
            </Headline>

            <BodyText className="mb-4">
              Most ambitious founders trying to grow online hit the same wall. They hire a marketing
              agency that generates traffic — but can&apos;t touch the site. They hire a dev agency
              to build the site — but they don&apos;t talk to the marketing team. They get a
              freelance designer — who doesn&apos;t know what either side is doing. Three vendors,
              three Slack channels, zero coordination.
            </BodyText>

            <BodyText className="mb-8">
              The result: ad spend goes to pages that don&apos;t convert. The site gets rebuilt
              without the ad team&apos;s input. The design doesn&apos;t match the brand the marketer
              is building.
            </BodyText>

            <Headline as="h3" className="mb-4">
              We fixed this by being one team.
            </Headline>

            <BodyText>
              When Nishant builds the landing page, Manu is already thinking about the ad creative.
              When the CRO test goes into design, we already know which campaigns will point to it.
              The site and the growth motion are never out of sync.
            </BodyText>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
