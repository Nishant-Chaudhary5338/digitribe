import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Section,
} from '@react-email/components'

type Props = {
  name: string
  email: string
  bookingTime: string
}

export function AuditConfirmationEmail({ name, email, bookingTime }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0a0e27', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
          <Heading
            style={{
              color: '#f0ede5',
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            Your audit is booked, {name}.
          </Heading>

          <Text
            style={{
              color: '#c8c4b8',
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            We have your 30-min website audit confirmed. See the details below.
          </Text>

          <Hr style={{ borderColor: '#2a2e4a', marginBottom: 24 }} />

          <Section style={{ marginBottom: 32 }}>
            <Text style={{ color: '#f0ede5', fontSize: 15, margin: '0 0 8px' }}>
              <strong>Name:</strong> {name}
            </Text>
            <Text style={{ color: '#f0ede5', fontSize: 15, margin: '0 0 8px' }}>
              <strong>Email:</strong> {email}
            </Text>
            <Text style={{ color: '#f0ede5', fontSize: 15, margin: '0 0 8px' }}>
              <strong>Time:</strong> {bookingTime}
            </Text>
          </Section>

          <Text style={{ color: '#c8c4b8', fontSize: 14, lineHeight: 1.6 }}>
            We'll send a calendar invite and a short prep form shortly. If anything
            changes, reply to this email and we'll sort it out.
          </Text>

          <Hr style={{ borderColor: '#2a2e4a', marginTop: 40, marginBottom: 24 }} />

          <Text style={{ color: '#6b7280', fontSize: 13 }}>
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
