import { Container } from '@/components/layout/container'

interface Stat {
  value: string
  label: string
}

const stats: Stat[] = [
  { value: '5+ years', label: 'Senior practitioners' },
  { value: '2 specialists', label: 'Under one roof' },
  { value: 'EU + US', label: 'Client regions' },
]

export function StatStrip() {
  return (
    <section className="bg-[#0a0e27] py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="flex flex-col items-center justify-center gap-0 divide-y divide-[#ff5b3a] sm:flex-row sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="flex flex-col items-center px-8 py-6 text-center sm:py-0 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="text-3xl leading-tight font-bold text-[#f0ede5] sm:text-4xl">
                {stat.value}
              </span>
              <span className="mt-1 text-sm text-[#c4c1b8]">{stat.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
