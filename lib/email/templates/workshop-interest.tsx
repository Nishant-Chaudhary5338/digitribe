import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
} from '@react-email/components'

type Props = { email: string }

export function WorkshopInterestEmail({ email }: Props) {
  const timestamp = new Date().toISOString()

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f0ede5', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ color: '#0a0e27', fontSize: 22, marginBottom: 8 }}>
            Workshop interest signup
          </Heading>
          <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 24 }}>
            Received at {timestamp}
          </Text>
          <Hr />
          <Text style={{ color: '#0a0e27', fontSize: 15, marginTop: 24 }}>
            <strong>Email:</strong> {email}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 13 }}>
            Add to the workshop waitlist and follow up when the next cohort opens.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
