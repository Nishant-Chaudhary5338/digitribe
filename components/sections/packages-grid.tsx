import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { Headline } from "@/components/primitives/headline";
import { BodyText } from "@/components/primitives/body-text";
import { Card } from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { Reveal } from "@/components/primitives/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { packages } from "@/lib/data/packages";
import type { Package } from "@/lib/data/packages";

function PackageCard({ pkg, index }: { pkg: Package; index: number }) {
  const isRecommended = pkg.recommended === true;

  return (
    <Reveal delay={index * 0.1}>
      <div
        className={[
          "relative h-full flex flex-col rounded-2xl border p-6 sm:p-8 transition-shadow",
          isRecommended
            ? "border-l-4 border-l-[#ff5b3a] border-t-[#2d3748] border-r-[#2d3748] border-b-[#2d3748] bg-[#1a1f3a] shadow-xl"
            : "border-[#2d3748] bg-white",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isRecommended && (
          <div className="absolute -top-3 left-6">
            <Badge variant="pulse">Most popular</Badge>
          </div>
        )}

        <div className="mb-4 mt-2">
          <p className="text-xs text-[#c4c1b8] mb-1 uppercase tracking-wide">
            {pkg.positioning}
          </p>
          <Headline
            as="h3"
            className={isRecommended ? "text-[#f0ede5]" : "text-[#0a0e27]"}
          >
            {pkg.name}
          </Headline>
        </div>

        <BodyText
          className={`mb-5 text-sm ${isRecommended ? "text-[#c4c1b8]" : "text-[#2d3748]"}`}
        >
          {pkg.oneLiner}
        </BodyText>

        <div className="mb-6">
          <p
            className={`text-3xl font-bold ${isRecommended ? "text-[#f0ede5]" : "text-[#0a0e27]"}`}
          >
            {pkg.priceEur}
          </p>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {pkg.inclusions.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2
                className="text-[#ff5b3a] mt-0.5 flex-shrink-0"
                size={16}
              />
              <span
                className={`text-sm ${isRecommended ? "text-[#c4c1b8]" : "text-[#2d3748]"}`}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          {isRecommended ? (
            <Button asChild variant="primary" className="w-full">
              <Link href="/audit">Book the free audit</Link>
            </Button>
          ) : (
            <Button asChild variant="secondary" className="w-full">
              <Link href="/audit">Book the free audit</Link>
            </Button>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export function PackagesGrid() {
  return (
    <section className="bg-[#f0ede5] py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <div className="text-center mb-12">
            <Eyebrow className="text-[#2d3748]">Flagship packages</Eyebrow>
            <Headline as="h2" className="text-[#0a0e27] mt-4">
              Three packages. One team. Full funnel.
            </Headline>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {packages.map((pkg, index) => (
            <PackageCard key={pkg.name} pkg={pkg} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
