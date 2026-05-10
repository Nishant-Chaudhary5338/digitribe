"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { Headline } from "@/components/primitives/headline";
import { Reveal } from "@/components/primitives/reveal";
import { Container } from "@/components/layout/container";
import { auditFaqs } from "@/lib/data/faqs";
import type { FAQ } from "@/lib/data/faqs";

function FaqItem({ faq, index }: { faq: FAQ; index: number }) {
  const [open, setOpen] = useState(false);
  const triggerId = `faq-trigger-${index}`;
  const regionId = `faq-region-${index}`;

  return (
    <div className="border-b border-[#2d3748] last:border-b-0">
      <button
        id={triggerId}
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="text-[#2d3748] font-medium">{faq.question}</span>
        <ChevronDown
          size={18}
          className={[
            "text-[#ff5b3a] flex-shrink-0 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
          aria-hidden
        />
      </button>

      <div
        id={regionId}
        role="region"
        aria-labelledby={triggerId}
        className="overflow-hidden"
        style={{
          maxHeight: open ? 500 : 0,
          transition: "max-height 0.25s ease",
        }}
      >
        <p className="text-[#2d3748] text-sm pb-5 leading-relaxed">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export function AuditFaq() {
  return (
    <section className="bg-[#f0ede5] py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <div className="max-w-2xl mx-auto">
            <Eyebrow className="text-[#2d3748]">Quick answers</Eyebrow>
            <Headline as="h2" className="text-[#0a0e27] mt-4 mb-8">
              Things people ask.
            </Headline>

            <div>
              {auditFaqs.map((faq, index) => (
                <FaqItem key={faq.question} faq={faq} index={index} />
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
