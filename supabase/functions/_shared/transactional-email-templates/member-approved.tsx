/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Html, Head, Body, Container, Text, Button, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface MemberApprovedProps {
  memberName?: string
  chapterName?: string
  loginUrl?: string
}

const MemberApprovedEmail: React.FC<MemberApprovedProps> = ({
  memberName = 'there',
  chapterName = 'the chapter',
  loginUrl = 'https://greek-connect-ai.lovable.app/login',
}) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>🎉 Congrats!</Text>
        <Text style={paragraph}>
          Hey {memberName}, congrats! You were accepted into <strong>{chapterName}</strong>!
        </Text>
        <Text style={paragraph}>
          Log in to start collaborating with your chapter.
        </Text>
        <Button style={button} href={loginUrl}>
          Log In Now
        </Button>
        <Hr style={hr} />
        <Text style={footer}>
          — The GreekBid Team
        </Text>
      </Container>
    </Body>
  </Html>
)

const main: React.CSSProperties = {
  backgroundColor: '#faf8f5',
  fontFamily: "'DM Sans', Arial, sans-serif",
}

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '40px 24px',
  maxWidth: '480px',
}

const heading: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  color: hsl(25, 20, 15),
  textAlign: 'center' as const,
  marginBottom: '16px',
}

const paragraph: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: hsl(25, 20, 15),
  marginBottom: '16px',
}

const button: React.CSSProperties = {
  backgroundColor: hsl(16, 65, 55),
  color: '#faf8f5',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 600,
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'block',
  textAlign: 'center' as const,
}

const hr: React.CSSProperties = {
  borderColor: '#e5e0d8',
  margin: '32px 0',
}

const footer: React.CSSProperties = {
  fontSize: '13px',
  color: hsl(25, 10, 50),
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`
}

export const template = {
  component: MemberApprovedEmail,
  subject: (data: MemberApprovedProps) =>
    `Congrats! You were accepted into ${data.chapterName || 'the chapter'}!`,
  displayName: 'Member Approved',
  previewData: {
    memberName: 'Alex',
    chapterName: 'Alpha Phi',
    loginUrl: 'https://greek-connect-ai.lovable.app/login',
  },
} satisfies TemplateEntry
