import { CheckCircle2 } from "lucide-react";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { Headline } from "@/components/primitives/headline";
import { Reveal } from "@/components/primitives/reveal";
import { Container } from "@/components/layout/container";

const promises = [
  "A live walkthrough of your site focused on conversion leaks",
  "A review of your Meta and/or Google ad account",
  "A funnel teardown — where users drop, why, and what fixes have the highest leverage",
  "A short Loom recap you can share with your team",
];

export function AuditPromise() {
  return (
    <section className="bg-[#f0ede5] py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <div className="max-w-2xl mx-auto">
            <Eyebrow className="text-[#2d3748]">What you'll get</Eyebrow>
            <Headline as="h2" className="text-[#0a0e27] mt-4 mb-8">
              Here's what 30 minutes gets you.
            </Headline>

            <ul className="space-y-4">
              {promises.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    className="text-[#ff5b3a] mt-0.5 flex-shrink-0"
                    size={20}
                  />
                  <span className="text-[#2d3748]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
