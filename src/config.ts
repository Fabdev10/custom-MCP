import dotenv from "dotenv";
import { z } from "zod";
import { AppConfig, EmailProviderKind } from "./types/email.js";

dotenv.config();

const envSchema = z.object({
  EMAIL_PROVIDER: z.enum(["mock", "imap-smtp", "gmail", "outlook"]).default("mock"),
  EMAIL_DEFAULT_FROM: z.string().min(1).default("no-reply@example.com"),

  IMAP_HOST: z.string().optional(),
  IMAP_PORT: z.coerce.number().optional(),
  IMAP_SECURE: z.coerce.boolean().optional(),
  IMAP_USER: z.string().optional(),
  IMAP_PASSWORD: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z.coerce.boolean().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
  GMAIL_REFRESH_TOKEN: z.string().optional(),

  OUTLOOK_TENANT_ID: z.string().optional(),
  OUTLOOK_CLIENT_ID: z.string().optional(),
  OUTLOOK_CLIENT_SECRET: z.string().optional(),
  OUTLOOK_USER_ID: z.string().optional(),
});

function requireFields(values: Record<string, string | undefined>, label: string): void {
  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`[config] Campi mancanti per ${label}: ${missing.join(", ")}`);
  }
}

export function loadConfig(): AppConfig {
  const env = envSchema.parse(process.env);
  const provider = env.EMAIL_PROVIDER as EmailProviderKind;

  const config: AppConfig = {
    emailProvider: provider,
    defaultFrom: env.EMAIL_DEFAULT_FROM,
  };

  if (provider === "imap-smtp") {
    requireFields(
      {
        IMAP_HOST: env.IMAP_HOST,
        IMAP_USER: env.IMAP_USER,
        IMAP_PASSWORD: env.IMAP_PASSWORD,
        SMTP_HOST: env.SMTP_HOST,
        SMTP_USER: env.SMTP_USER,
        SMTP_PASSWORD: env.SMTP_PASSWORD,
      },
      "provider imap-smtp"
    );

    config.imapSmtp = {
      imapHost: env.IMAP_HOST!,
      imapPort: env.IMAP_PORT ?? 993,
      imapSecure: env.IMAP_SECURE ?? true,
      imapUser: env.IMAP_USER!,
      imapPassword: env.IMAP_PASSWORD!,
      smtpHost: env.SMTP_HOST!,
      smtpPort: env.SMTP_PORT ?? 587,
      smtpSecure: env.SMTP_SECURE ?? false,
      smtpUser: env.SMTP_USER!,
      smtpPassword: env.SMTP_PASSWORD!,
    };
  }

  if (provider === "gmail") {
    requireFields(
      {
        GMAIL_CLIENT_ID: env.GMAIL_CLIENT_ID,
        GMAIL_CLIENT_SECRET: env.GMAIL_CLIENT_SECRET,
        GMAIL_REFRESH_TOKEN: env.GMAIL_REFRESH_TOKEN,
      },
      "provider gmail"
    );

    config.gmail = {
      clientId: env.GMAIL_CLIENT_ID!,
      clientSecret: env.GMAIL_CLIENT_SECRET!,
      refreshToken: env.GMAIL_REFRESH_TOKEN!,
    };
  }

  if (provider === "outlook") {
    requireFields(
      {
        OUTLOOK_TENANT_ID: env.OUTLOOK_TENANT_ID,
        OUTLOOK_CLIENT_ID: env.OUTLOOK_CLIENT_ID,
        OUTLOOK_CLIENT_SECRET: env.OUTLOOK_CLIENT_SECRET,
        OUTLOOK_USER_ID: env.OUTLOOK_USER_ID,
      },
      "provider outlook"
    );

    config.outlook = {
      tenantId: env.OUTLOOK_TENANT_ID!,
      clientId: env.OUTLOOK_CLIENT_ID!,
      clientSecret: env.OUTLOOK_CLIENT_SECRET!,
      userId: env.OUTLOOK_USER_ID!,
    };
  }

  return config;
}
