import { Users, Package, Eye, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { Headline } from "@/components/primitives/headline";
import { BodyText } from "@/components/primitives/body-text";
import { Card } from "@/components/primitives/card";
import { Reveal } from "@/components/primitives/reveal";
import { IconCircle } from "@/components/primitives/icon-circle";
import { Container } from "@/components/layout/container";

interface Guarantee {
  icon: LucideIcon;
  title: string;
  body: string;
}

const guarantees: Guarantee[] = [
  {
    icon: Users,
    title: "You talk to the makers.",
    body: "The three of us run the work and the calls. No account-manager telephone game.",
  },
  {
    icon: Package,
    title: "Productized scope.",
    body: "Fixed deliverables, fixed timelines, fixed prices. No surprise invoices.",
  },
  {
    icon: Eye,
    title: "Weekly visibility.",
    body: "Every active engagement gets a Loom or 30-min call every week. We never go dark.",
  },
  {
    icon: BarChart3,
    title: "Numbers we agree on.",
    body: "Before we start, we agree on the metrics that matter. We report on them weekly.",
  },
];

export function HowWeWork() {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24"
      style={{ background: 'var(--color-bg-card-alt)' }}
    >
      <Container>
        <Reveal>
          <div className="text-center mb-12">
            <Eyebrow>Why us</Eyebrow>
            <Headline as="h2" className="mt-4">
              Four things every Digitribe engagement guarantees.
            </Headline>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 0.1}>
                <Card variant="inverted" className="h-full flex flex-col p-6">
                  <IconCircle icon={Icon} size="sm" className="mb-4 shrink-0" />
                  <Headline as="h4" className="mb-2 text-base">
                    {item.title}
                  </Headline>
                  <BodyText className="text-sm">
                    {item.body}
                  </BodyText>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
