import { CheckCircle2, X } from "lucide-react";
import { Headline } from "@/components/primitives/headline";
import { Reveal } from "@/components/primitives/reveal";
import { Container } from "@/components/layout/container";

const forYou = [
  "DTC brand between $1M and $20M ARR",
  "SaaS startup Seed to Series A",
  "Spending $1k+ per month on paid advertising",
  "Site that needs to convert better",
  "Want to talk to the people doing the actual work",
];

const notForYou = [
  "Looking for the lowest-bid quote across 5 agencies",
  "Want a 6-month strategy deck before anything is built",
  "Enterprise procurement process (12-month sales cycles)",
  "White-label work for other agencies",
];

export function AuditNotFor() {
  return (
    <section className="bg-[#f0ede5] py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <div className="max-w-3xl mx-auto">
            <Headline as="h2" className="text-[#0a0e27] mb-10">
              Is this for you?
            </Headline>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-semibold text-[#2d3748] uppercase tracking-wide mb-4">
                  For you
                </p>
                <ul className="space-y-3">
                  {forYou.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2
                        className="text-[#ff5b3a] mt-0.5 flex-shrink-0"
                        size={18}
                      />
                      <span className="text-[#2d3748] text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#2d3748] uppercase tracking-wide mb-4">
                  Not for you
                </p>
                <ul className="space-y-3">
                  {notForYou.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <X
                        className="text-[#2d3748] mt-0.5 flex-shrink-0 opacity-60"
                        size={18}
                      />
                      <span className="text-[#2d3748] text-sm opacity-70">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
