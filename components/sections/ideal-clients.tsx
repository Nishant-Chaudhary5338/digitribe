import { Eyebrow } from "@/components/primitives/eyebrow";
import { Headline } from "@/components/primitives/headline";
import { BodyText } from "@/components/primitives/body-text";
import { Card } from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { Reveal } from "@/components/primitives/reveal";
import { Container } from "@/components/layout/container";

export function IdealClients() {
  return (
    <section className="bg-[#0a0e27] py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <div className="text-center mb-12">
            <Eyebrow className="text-[#c4c1b8]">Who we work with</Eyebrow>
            <Headline as="h2" className="text-[#f0ede5] mt-4">
              We're built for two kinds of founders.
            </Headline>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal delay={0.1}>
            <Card variant="outline" className="h-full flex flex-col p-6 sm:p-8">
              <Badge className="mb-4 self-start">DTC brands $5M-$20M ARR</Badge>

              <Headline as="h3" className="text-[#f0ede5] mb-4">
                E-commerce founders who've found their market.
              </Headline>

              <BodyText className="text-[#c4c1b8]">
                You've hit product-market fit. You're spending serious money on
                paid acquisition. You need a site that converts at the same
                level your ads deliver — and a team that can optimize both
                simultaneously.
              </BodyText>
            </Card>
          </Reveal>

          <Reveal delay={0.2}>
            <Card variant="outline" className="h-full flex flex-col p-6 sm:p-8">
              <Badge className="mb-4 self-start">Seed to Series A SaaS</Badge>

              <Headline as="h3" className="text-[#f0ede5] mb-4">
                Product-led founders who need a growth motion.
              </Headline>

              <BodyText className="text-[#c4c1b8]">
                You're past the launch site. You need product-credible marketing
                pages, a content motion, and paid acquisition that respects long
                sales cycles. You want a partner who ships product, not one who
                just decks it.
              </BodyText>
            </Card>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
