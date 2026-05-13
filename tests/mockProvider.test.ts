import { describe, expect, it } from "vitest";
import { MockEmailProvider } from "../src/providers/mockProvider.js";

describe("MockEmailProvider", () => {
  it("returns seed messages", async () => {
    const provider = new MockEmailProvider();
    const list = await provider.listMessages({});

    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty("id");
  });

  it("sends and retrieves a message", async () => {
    const provider = new MockEmailProvider();

    const sent = await provider.sendEmail({
      to: ["dest@example.com"],
      subject: "Test subject",
      textBody: "hello from test",
    });

    expect(sent.provider).toBe("mock");

    const fetched = await provider.getMessage(sent.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.subject).toBe("Test subject");
  });
});
