export type EmailProviderKind = "mock" | "imap-smtp" | "gmail" | "outlook";

export interface ListMessagesInput {
  query?: string;
  folder?: string;
  limit?: number;
}

export interface SendEmailInput {
  from?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  textBody?: string;
  htmlBody?: string;
}

export interface EmailMessageSummary {
  id: string;
  subject: string;
  from: string;
  preview: string;
  receivedAt: string;
}

export interface EmailMessageDetail {
  id: string;
  subject: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  textBody: string;
  htmlBody?: string;
  receivedAt: string;
}

export interface SendEmailResult {
  id: string;
  provider: EmailProviderKind;
  accepted: string[];
}

export interface EmailProvider {
  readonly kind: EmailProviderKind;

  listMessages(input: ListMessagesInput): Promise<EmailMessageSummary[]>;
  getMessage(messageId: string): Promise<EmailMessageDetail | null>;
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
}

export interface AppConfig {
  emailProvider: EmailProviderKind;
  defaultFrom: string;
  imapSmtp?: {
    imapHost: string;
    imapPort: number;
    imapSecure: boolean;
    imapUser: string;
    imapPassword: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    smtpPassword: string;
  };
  gmail?: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  outlook?: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    userId: string;
  };
}
