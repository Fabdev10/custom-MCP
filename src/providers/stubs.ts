import {
  EmailMessageDetail,
  EmailMessageSummary,
  EmailProvider,
  ListMessagesInput,
  SendEmailInput,
  SendEmailResult,
} from "../types/email.js";

export class NotImplementedProvider implements EmailProvider {
  public readonly kind: "imap-smtp" | "gmail" | "outlook";

  constructor(kind: "imap-smtp" | "gmail" | "outlook") {
    this.kind = kind;
  }

  public async listMessages(_input: ListMessagesInput): Promise<EmailMessageSummary[]> {
    this.raise();
  }

  public async getMessage(_messageId: string): Promise<EmailMessageDetail | null> {
    this.raise();
  }

  public async sendEmail(_input: SendEmailInput): Promise<SendEmailResult> {
    this.raise();
  }

  private raise(): never {
    throw new Error(
      `Provider '${this.kind}' non e ancora implementato. Estendi src/providers con SDK del provider scelto.`
    );
  }
}
