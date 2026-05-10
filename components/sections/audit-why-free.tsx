import { Eyebrow } from "@/components/primitives/eyebrow";
import { Headline } from "@/components/primitives/headline";
import { BodyText } from "@/components/primitives/body-text";
import { Reveal } from "@/components/primitives/reveal";
import { Container } from "@/components/layout/container";

export function AuditWhyFree() {
  return (
    <section className="bg-[#0a0e27] py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <div className="max-w-2xl mx-auto">
            <Eyebrow className="text-[#c4c1b8]">Why we do this</Eyebrow>

            <Headline as="h2" className="text-[#f0ede5] mt-4 mb-6">
              Honest answer: it's the best way to earn clients.
            </Headline>

            <BodyText className="text-[#c4c1b8] mb-4">
              We could write case studies and put logos on our homepage. We'd
              rather show you we know what we're doing by actually doing it. If
              we find three meaningful things to fix in your funnel in 30
              minutes, you'll draw your own conclusions about what we'd find in
              a full engagement.
            </BodyText>

            <BodyText className="text-[#c4c1b8]">
              About 30-40% of audit calls turn into paid engagements. The rest
              walk away with a useful punch list. Either outcome is fine with
              us.
            </BodyText>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
