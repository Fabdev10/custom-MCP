import { loadConfig } from "./config.js";
import { MockEmailProvider } from "./providers/mockProvider.js";
import { NotImplementedProvider } from "./providers/stubs.js";
import { EmailProvider } from "./types/email.js";

export function buildProviderFromEnv(): EmailProvider {
  const config = loadConfig();

  switch (config.emailProvider) {
    case "mock":
      return new MockEmailProvider([], { defaultFrom: config.defaultFrom });
    case "imap-smtp":
      return new NotImplementedProvider("imap-smtp");
    case "gmail":
      return new NotImplementedProvider("gmail");
    case "outlook":
      return new NotImplementedProvider("outlook");
    default:
      return new MockEmailProvider();
  }
}
