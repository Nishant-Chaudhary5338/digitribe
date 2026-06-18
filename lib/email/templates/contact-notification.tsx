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
import type { ContactInput } from '@/lib/validation/contact-schema'

type Props = { data: ContactInput }

export function ContactNotificationEmail({ data }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f0ede5', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ color: '#0a0e27', fontSize: 24, marginBottom: 8 }}>
            New lead: {data.company}
          </Heading>
          <Text style={{ color: '#6b7280', marginBottom: 24 }}>
            Budget: {data.budget} · Timeline: {data.timeline}
          </Text>
          <Hr />
          <Section style={{ marginTop: 24 }}>
            <Text>
              <strong>Name:</strong> {data.name}
            </Text>
            <Text>
              <strong>Email:</strong> {data.email}
            </Text>
            <Text>
              <strong>Company:</strong> {data.company}
            </Text>
            {data.websiteUrl && (
              <Text>
                <strong>Website:</strong> {data.websiteUrl}
              </Text>
            )}
            <Text>
              <strong>Needs:</strong> {data.needs.join(', ')}
            </Text>
            <Text>
              <strong>Budget:</strong> {data.budget}
            </Text>
            <Text>
              <strong>Timeline:</strong> {data.timeline}
            </Text>
            {data.notes && (
              <Text>
                <strong>Notes:</strong> {data.notes}
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
