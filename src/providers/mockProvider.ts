import crypto from "node:crypto";
import {
  EmailMessageDetail,
  EmailMessageSummary,
  EmailProvider,
  ListMessagesInput,
  SendEmailInput,
  SendEmailResult,
} from "../types/email.js";

interface MockStore {
  byId: Map<string, EmailMessageDetail>;
  orderedIds: string[];
}

export class MockEmailProvider implements EmailProvider {
  public readonly kind = "mock" as const;
  private readonly store: MockStore;

  constructor(seedMessages: EmailMessageDetail[] = []) {
    const byId = new Map<string, EmailMessageDetail>();
    const orderedIds: string[] = [];

    for (const message of seedMessages) {
      byId.set(message.id, message);
      orderedIds.push(message.id);
    }

    this.store = { byId, orderedIds };

    if (this.store.orderedIds.length === 0) {
      this.seedDefaults();
    }
  }

  public async listMessages(input: ListMessagesInput): Promise<EmailMessageSummary[]> {
    const limit = Math.max(1, Math.min(input.limit ?? 20, 100));
    const query = (input.query ?? "").trim().toLowerCase();

    const messages = this.store.orderedIds
      .map((id) => this.store.byId.get(id))
      .filter((v): v is EmailMessageDetail => Boolean(v));

    const filtered = query.length
      ? messages.filter((m) => {
          const haystack = `${m.subject} ${m.from} ${m.textBody}`.toLowerCase();
          return haystack.includes(query);
        })
      : messages;

    return filtered.slice(0, limit).map((m) => this.toSummary(m));
  }

  public async getMessage(messageId: string): Promise<EmailMessageDetail | null> {
    return this.store.byId.get(messageId) ?? null;
  }

  public async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    const id = `mock-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const detail: EmailMessageDetail = {
      id,
      subject: input.subject,
      from: input.from ?? "no-reply@example.com",
      to: input.to,
      cc: input.cc ?? [],
      bcc: input.bcc ?? [],
      textBody: input.textBody ?? "",
      htmlBody: input.htmlBody,
      receivedAt: now,
    };

    this.store.byId.set(id, detail);
    this.store.orderedIds.unshift(id);

    return {
      id,
      provider: this.kind,
      accepted: input.to,
    };
  }

  private toSummary(message: EmailMessageDetail): EmailMessageSummary {
    return {
      id: message.id,
      subject: message.subject,
      from: message.from,
      preview: message.textBody.slice(0, 120),
      receivedAt: message.receivedAt,
    };
  }

  private seedDefaults(): void {
    const now = new Date();
    const first: EmailMessageDetail = {
      id: "mock-seed-1",
      subject: "Benvenuto nel tuo MCP server email",
      from: "system@example.com",
      to: ["you@example.com"],
      cc: [],
      bcc: [],
      textBody: "Questo e un messaggio seed per testare listMessages/getMessage.",
      receivedAt: now.toISOString(),
    };

    const second: EmailMessageDetail = {
      id: "mock-seed-2",
      subject: "Provider agnostico pronto",
      from: "noreply@example.com",
      to: ["you@example.com"],
      cc: [],
      bcc: [],
      textBody: "Implementa i provider reali mantenendo l'interfaccia EmailProvider.",
      receivedAt: new Date(now.getTime() - 60_000).toISOString(),
    };

    this.store.byId.set(first.id, first);
    this.store.byId.set(second.id, second);
    this.store.orderedIds.push(first.id, second.id);
  }
}
