import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Section,
  Button,
} from '@react-email/components'

type Props = { name: string }

export function ContactConfirmationEmail({ name }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0a0e27', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
          <Heading
            style={{
              color: '#f0ede5',
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 16,
              lineHeight: 1.3,
            }}
          >
            Got it, {name}.
          </Heading>

          <Text
            style={{
              color: '#c8c4b8',
              fontSize: 16,
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            One of us will reply within 24 hours. We read every message ourselves,
            so you'll hear from a real person, not an automated sequence.
          </Text>

          <Hr style={{ borderColor: '#2a2e4a', marginBottom: 24 }} />

          <Section style={{ marginBottom: 32 }}>
            <Text
              style={{
                color: '#f0ede5',
                fontSize: 15,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              What happens next
            </Text>
            <Text style={{ color: '#c8c4b8', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              1. We review your brief and look at your current site (if you have one).
            </Text>
            <Text style={{ color: '#c8c4b8', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              2. We come back with a straight answer: whether we're a fit and what we'd do.
            </Text>
            <Text style={{ color: '#c8c4b8', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              3. If you want to move faster, book a free 30-min audit below.
            </Text>
          </Section>

          <Button
            href="https://digitribe.world/audit"
            style={{
              backgroundColor: '#f0ede5',
              color: '#0a0e27',
              fontSize: 15,
              fontWeight: 600,
              padding: '14px 28px',
              borderRadius: 6,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Book a free 30-min audit
          </Button>

          <Hr style={{ borderColor: '#2a2e4a', marginTop: 40, marginBottom: 24 }} />

          <Text
            style={{
              color: '#6b7280',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            The Digitribe team
            <br />
            <a href="https://digitribe.world" style={{ color: '#6b7280' }}>
              digitribe.world
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
