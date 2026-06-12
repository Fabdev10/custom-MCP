import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildProviderFromEnv } from "./providerFactory.js";

const provider = buildProviderFromEnv();

const server = new McpServer({
  name: "custom-email-mcp-server",
  version: "0.1.0",
});

server.tool(
  "email_list_messages",
  "Elenca i messaggi email con filtro opzionale",
  {
    query: z.string().optional(),
    from: z.string().optional(),
    folder: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
    unreadOnly: z.boolean().optional(),
    receivedAfter: z.string().datetime().optional(),
    receivedBefore: z.string().datetime().optional(),
  },
  async (input) => {
    const messages = await provider.listMessages(input);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ provider: provider.kind, count: messages.length, messages }, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "email_list_folders",
  "Elenca le cartelle disponibili con conteggi messaggi",
  {},
  async () => {
    const folders = await provider.listFolders();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ provider: provider.kind, count: folders.length, folders }, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "email_get_message",
  "Recupera il dettaglio di un messaggio email per id",
  {
    messageId: z.string().min(1),
  },
  async ({ messageId }) => {
    const message = await provider.getMessage(messageId);
    if (!message) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ provider: provider.kind, found: false, messageId }, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ provider: provider.kind, found: true, message }, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "email_update_message",
  "Aggiorna cartella o stato letto/non letto di un messaggio",
  {
    messageId: z.string().min(1),
    folder: z.string().min(1).optional(),
    isRead: z.boolean().optional(),
  },
  async (input) => {
    if (typeof input.folder === "undefined" && typeof input.isRead === "undefined") {
      throw new Error("Specifica almeno uno tra 'folder' e 'isRead'.");
    }

    const result = await provider.updateMessage(input);
    if (!result) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ provider: provider.kind, updated: false, messageId: input.messageId }, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ provider: provider.kind, updated: true, result }, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "email_send",
  "Invia una email",
  {
    from: z.string().email().optional(),
    to: z.array(z.string().email()).min(1),
    cc: z.array(z.string().email()).optional(),
    bcc: z.array(z.string().email()).optional(),
    subject: z.string().min(1),
    textBody: z.string().optional(),
    htmlBody: z.string().optional(),
  },
  async (input) => {
    const result = await provider.sendEmail(input);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ ok: true, result }, null, 2),
        },
      ],
    };
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  const reason = error instanceof Error ? error.message : String(error);
  console.error(`[mcp] Startup failed: ${reason}`);
  process.exit(1);
});
