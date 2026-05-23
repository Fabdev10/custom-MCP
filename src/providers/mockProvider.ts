import crypto from "node:crypto";
import {
  EmailMessageDetail,
  EmailMessageSummary,
  EmailFolderSummary,
  EmailProvider,
  ListMessagesInput,
  SendEmailInput,
  SendEmailResult,
  UpdateMessageInput,
  UpdateMessageResult,
} from "../types/email.js";

interface MockStore {
  byId: Map<string, EmailMessageDetail>;
  orderedIds: string[];
}

interface MockEmailProviderOptions {
  defaultFrom?: string;
}

export class MockEmailProvider implements EmailProvider {
  public readonly kind = "mock" as const;
  private readonly store: MockStore;
  private readonly defaultFrom: string;

  constructor(seedMessages: EmailMessageDetail[] = [], options: MockEmailProviderOptions = {}) {
    const byId = new Map<string, EmailMessageDetail>();
    const orderedIds: string[] = [];

    this.defaultFrom = options.defaultFrom ?? "no-reply@example.com";

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
    const folder = (input.folder ?? "").trim().toLowerCase();
    const unreadOnly = input.unreadOnly ?? false;

    const messages = this.store.orderedIds
      .map((id) => this.store.byId.get(id))
      .filter((v): v is EmailMessageDetail => Boolean(v));

    const filtered = messages.filter((message) => {
      if (folder && message.folder.toLowerCase() !== folder) {
        return false;
      }

      if (unreadOnly && message.isRead) {
        return false;
      }

      if (!query.length) {
        return true;
      }

      const haystack = `${message.subject} ${message.from} ${message.textBody}`.toLowerCase();
      return haystack.includes(query);
    });

    return filtered.slice(0, limit).map((m) => this.toSummary(m));
  }

  public async listFolders(): Promise<EmailFolderSummary[]> {
    const folders = new Map<string, EmailFolderSummary>();

    for (const id of this.store.orderedIds) {
      const message = this.store.byId.get(id);
      if (!message) {
        continue;
      }

      const key = message.folder.toLowerCase();
      const current = folders.get(key);
      if (current) {
        current.totalMessages += 1;
        if (!message.isRead) {
          current.unreadMessages += 1;
        }
        continue;
      }

      folders.set(key, {
        id: key,
        name: message.folder,
        totalMessages: 1,
        unreadMessages: message.isRead ? 0 : 1,
      });
    }

    return [...folders.values()].sort((left, right) => left.name.localeCompare(right.name));
  }

  public async getMessage(messageId: string): Promise<EmailMessageDetail | null> {
    return this.store.byId.get(messageId) ?? null;
  }

  public async updateMessage(input: UpdateMessageInput): Promise<UpdateMessageResult | null> {
    const current = this.store.byId.get(input.messageId);
    if (!current) {
      return null;
    }

    const nextFolder = typeof input.folder === "string" && input.folder.trim().length > 0 ? input.folder.trim() : current.folder;
    const nextIsRead = typeof input.isRead === "boolean" ? input.isRead : current.isRead;

    const updated: EmailMessageDetail = {
      ...current,
      folder: nextFolder,
      isRead: nextIsRead,
    };

    this.store.byId.set(current.id, updated);

    return {
      id: updated.id,
      provider: this.kind,
      folder: updated.folder,
      isRead: updated.isRead,
    };
  }

  public async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    const id = `mock-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const detail: EmailMessageDetail = {
      id,
      subject: input.subject,
      from: input.from ?? this.defaultFrom,
      to: input.to,
      cc: input.cc ?? [],
      bcc: input.bcc ?? [],
      folder: "sent",
      isRead: true,
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
      folder: message.folder,
      isRead: message.isRead,
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
      folder: "inbox",
      isRead: false,
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
      folder: "archive",
      isRead: true,
      textBody: "Implementa i provider reali mantenendo l'interfaccia EmailProvider.",
      receivedAt: new Date(now.getTime() - 60_000).toISOString(),
    };

    this.store.byId.set(first.id, first);
    this.store.byId.set(second.id, second);
    this.store.orderedIds.push(first.id, second.id);
  }
}
