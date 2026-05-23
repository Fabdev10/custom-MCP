import { describe, expect, it } from "vitest";
import { MockEmailProvider } from "../src/providers/mockProvider.js";

describe("MockEmailProvider", () => {
  it("returns seed messages", async () => {
    const provider = new MockEmailProvider();
    const list = await provider.listMessages({});

    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty("id");
    expect(list[0]).toHaveProperty("folder");
  });

  it("filters seed messages by folder and unread state", async () => {
    const provider = new MockEmailProvider();

    const inbox = await provider.listMessages({ folder: "inbox", unreadOnly: true });
    const archive = await provider.listMessages({ folder: "archive" });

    expect(inbox).toHaveLength(1);
    expect(inbox[0]?.folder).toBe("inbox");
    expect(inbox[0]?.isRead).toBe(false);
    expect(archive).toHaveLength(1);
    expect(archive[0]?.folder).toBe("archive");
  });

  it("lists folders with aggregated counts", async () => {
    const provider = new MockEmailProvider();

    const folders = await provider.listFolders();

    expect(folders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "archive", totalMessages: 1, unreadMessages: 0 }),
        expect.objectContaining({ id: "inbox", totalMessages: 1, unreadMessages: 1 }),
      ])
    );
  });

  it("sends and retrieves a message", async () => {
    const provider = new MockEmailProvider([], { defaultFrom: "configured@example.com" });

    const sent = await provider.sendEmail({
      to: ["dest@example.com"],
      subject: "Test subject",
      textBody: "hello from test",
    });

    expect(sent.provider).toBe("mock");

    const fetched = await provider.getMessage(sent.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.subject).toBe("Test subject");
    expect(fetched?.from).toBe("configured@example.com");
    expect(fetched?.folder).toBe("sent");
    expect(fetched?.isRead).toBe(true);
  });

  it("updates message state and folder", async () => {
    const provider = new MockEmailProvider();

    const updated = await provider.updateMessage({
      messageId: "mock-seed-1",
      folder: "processed",
      isRead: true,
    });

    expect(updated).toEqual({
      id: "mock-seed-1",
      provider: "mock",
      folder: "processed",
      isRead: true,
    });

    const fetched = await provider.getMessage("mock-seed-1");
    expect(fetched?.folder).toBe("processed");
    expect(fetched?.isRead).toBe(true);
  });
});
