import { describe, it, expect, vi, afterEach } from "vitest";
import { writeRichClipboard } from "../clipboard";

/**
 * Covers the dual-flavour clipboard write: one item carrying both HTML and
 * plain text, so the paste target picks what it understands.
 */

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("writeRichClipboard", () => {
  it("writes HTML and Markdown as one item", async () => {
    const written: Array<Record<string, Blob>> = [];
    vi.stubGlobal(
      "ClipboardItem",
      class {
        constructor(public items: Record<string, Blob>) {
          written.push(items);
        }
      },
    );
    const write = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { write, writeText } });

    await writeRichClipboard({ html: "<p><b>Hi</b></p>", text: "**Hi**" });

    expect(write).toHaveBeenCalledTimes(1);
    expect(writeText).not.toHaveBeenCalled();
    expect(Object.keys(written[0]!).sort()).toEqual(["text/html", "text/plain"]);
    expect(await written[0]!["text/html"]!.text()).toBe("<p><b>Hi</b></p>");
    expect(await written[0]!["text/plain"]!.text()).toBe("**Hi**");
  });

  it("falls back to Markdown as plain text without ClipboardItem", async () => {
    vi.stubGlobal("ClipboardItem", undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await writeRichClipboard({ html: "<p>Hi</p>", text: "Hi" });

    expect(writeText).toHaveBeenCalledWith("Hi");
  });
});
