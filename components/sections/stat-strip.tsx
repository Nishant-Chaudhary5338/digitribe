import { Container } from "@/components/layout/container";

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: "5+ years", label: "Senior practitioners" },
  { value: "3 specialists", label: "Under one roof" },
  { value: "EU + US", label: "Client regions" },
];

export function StatStrip() {
  return (
    <section className="bg-[#0a0e27] py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#ff5b3a]">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="flex flex-col items-center text-center px-8 py-6 sm:py-0 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="text-3xl sm:text-4xl font-bold text-[#f0ede5] leading-tight">
                {stat.value}
              </span>
              <span className="text-sm text-[#c4c1b8] mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
