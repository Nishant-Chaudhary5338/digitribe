"use client";

import { Eyebrow } from "@/components/primitives/eyebrow";
import { Headline } from "@/components/primitives/headline";
import { BodyText } from "@/components/primitives/body-text";
import { Reveal } from "@/components/primitives/reveal";
import { Container } from "@/components/layout/container";
import WorkshopInterestForm from "@/components/forms/workshop-interest-form";

const takeaways = [
  "Profitable campaign live in your ad account",
  "Creative testing framework",
  "Weekly optimization rhythm that takes 30 minutes",
  "Clear answer on what's working and why",
  "Recordings of both days indefinitely",
];

export function WorkshopComingSoon() {
  return (
    <section className="bg-[#0a0e27] py-24 sm:py-28 lg:py-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <Eyebrow className="text-[#c4c1b8]">Coming soon</Eyebrow>

            <Headline as="h1" className="text-[#f0ede5] mt-4 mb-3">
              From Zero to Profitable Meta Ads in 48 Hours.
            </Headline>

            <p className="text-[#c4c1b8] text-base mb-6">
              A 2-day live online intensive for founders running their own paid
              acquisition. Quarterly cohorts. 20 seats max.
            </p>

            <BodyText className="text-[#c4c1b8] mb-10">
              Manu teaches this. Hands-on — you leave with a profitable campaign
              running in your own ad account, not a slide deck.
            </BodyText>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mb-10">
              <p className="text-[#f0ede5] font-medium mb-4">
                What you'll leave with:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {takeaways.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[#c4c1b8] text-sm"
                  >
                    <span className="text-[#ff5b3a] mt-0.5 flex-shrink-0">
                      &#10003;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <WorkshopInterestForm />
          </Reveal>

          <Reveal delay={0.3}>
            <p className="text-[#c4c1b8] text-xs mt-6">
              Run by Manu — trainer with significant experience in digital
              marketing education.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
