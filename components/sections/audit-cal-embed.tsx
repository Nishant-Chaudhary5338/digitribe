"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { Headline } from "@/components/primitives/headline";
import { BodyText } from "@/components/primitives/body-text";
import { Container } from "@/components/layout/container";
import { CAL_URL } from "@/lib/utils/constants";

function trackEvent(name: string): void {
  if (typeof window !== "undefined" && (window as { plausible?: (event: string) => void }).plausible) {
    (window as { plausible?: (event: string) => void }).plausible!(name);
  }
}

export function AuditCalEmbed() {
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent): void {
      if (
        event.data &&
        typeof event.data === "object" &&
        "type" in event.data &&
        event.data.type === "booking-successful"
      ) {
        trackEvent("audit_booking_completed");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function handleLoad(): void {
    setLoaded(true);
    trackEvent("audit_calendar_loaded");
  }

  return (
    <section
      className="py-16 sm:py-20 lg:py-24"
      style={{ background: 'var(--color-bg-inverse)' }}
    >
      <Container>
        <div className="text-center mb-10">
          <Eyebrow className="text-[#c4c1b8]">Pick a time</Eyebrow>
          <Headline as="h2" className="text-[#f0ede5] mt-4 mb-4">
            Pick a time that works.
          </Headline>
          <BodyText className="text-[#c4c1b8] max-w-lg mx-auto">
            30 minutes. We'll come prepared with a teardown of your site. You
            bring your biggest question.
          </BodyText>
        </div>

        <div className="relative rounded-2xl overflow-hidden">
          {!loaded && (
            <div
              className="absolute inset-0 bg-[#1a1f3a] animate-pulse rounded-2xl"
              style={{ height: 700 }}
              aria-label="Loading calendar..."
              role="status"
            >
              <div className="h-full flex items-center justify-center">
                <p className="text-[#c4c1b8] text-sm">Loading calendar...</p>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={CAL_URL}
            width="100%"
            height="700"
            frameBorder="0"
            title="Book a free 30-minute audit with Digitribe"
            onLoad={handleLoad}
            className={loaded ? "opacity-100" : "opacity-0"}
            style={{ transition: "opacity 0.3s ease" }}
          />
        </div>
      </Container>
    </section>
  );
}
