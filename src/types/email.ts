export type EmailProviderKind = "mock" | "imap-smtp" | "gmail" | "outlook";

export interface ListMessagesInput {
  query?: string;
  folder?: string;
  limit?: number;
  unreadOnly?: boolean;
}

export interface UpdateMessageInput {
  messageId: string;
  folder?: string;
  isRead?: boolean;
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
  folder: string;
  isRead: boolean;
  receivedAt: string;
}

export interface EmailMessageDetail {
  id: string;
  subject: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  folder: string;
  isRead: boolean;
  textBody: string;
  htmlBody?: string;
  receivedAt: string;
}

export interface EmailFolderSummary {
  id: string;
  name: string;
  totalMessages: number;
  unreadMessages: number;
}

export interface SendEmailResult {
  id: string;
  provider: EmailProviderKind;
  accepted: string[];
}

export interface UpdateMessageResult {
  id: string;
  provider: EmailProviderKind;
  folder: string;
  isRead: boolean;
}

export interface EmailProvider {
  readonly kind: EmailProviderKind;

  listMessages(input: ListMessagesInput): Promise<EmailMessageSummary[]>;
  listFolders(): Promise<EmailFolderSummary[]>;
  getMessage(messageId: string): Promise<EmailMessageDetail | null>;
  updateMessage(input: UpdateMessageInput): Promise<UpdateMessageResult | null>;
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
