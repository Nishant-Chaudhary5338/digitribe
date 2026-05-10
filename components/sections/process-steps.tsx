import { Eyebrow } from "@/components/primitives/eyebrow";
import { Headline } from "@/components/primitives/headline";
import { BodyText } from "@/components/primitives/body-text";
import { Reveal } from "@/components/primitives/reveal";
import { Container } from "@/components/layout/container";

interface Step {
  number: string;
  title: string;
  body: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Free audit (30 min)",
    body: "We look at your current site, ad accounts, and funnel. We tell you what we'd change, with no pitch attached.",
  },
  {
    number: "02",
    title: "Scoped proposal (within 24 hrs)",
    body: "If there's a fit, we send a proposal with deliverables, timeline, milestones, and price. One page, one number, one Loom walkthrough.",
  },
  {
    number: "03",
    title: "Build and launch (2-8 weeks)",
    body: "We work in weekly sprints. You see progress every Friday. Nothing ships without your sign-off.",
  },
  {
    number: "04",
    title: "Optimize (ongoing)",
    body: "Most agencies disappear after launch. We don't. Every Digitribe build comes with 30 days of post-launch optimization based on real user data — included.",
  },
];

export function ProcessSteps() {
  return (
    <section
      id="process"
      className="bg-[#f0ede5] py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <Reveal>
          <div className="text-center mb-12">
            <Eyebrow className="text-[#2d3748]">Process</Eyebrow>
            <Headline as="h2" className="text-[#0a0e27] mt-4">
              From 'let's talk' to live in 4 weeks.
            </Headline>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.1}>
              <div className="flex flex-col">
                <span className="text-[80px] lg:text-[96px] font-bold text-[#ff5b3a] opacity-30 leading-none mb-3 select-none">
                  {step.number}
                </span>
                <Headline as="h3" className="text-[#0a0e27] mb-2 text-lg">
                  {step.title}
                </Headline>
                <BodyText className="text-[#2d3748] text-sm">
                  {step.body}
                </BodyText>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
