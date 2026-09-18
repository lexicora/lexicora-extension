import { describe, it, expect } from "vitest";
import { editorWrapperClassName } from "../use-editor-wide-mode";

describe("editorWrapperClassName", () => {
  it("uses the page content column when narrow", () => {
    const cls = editorWrapperClassName(false, true);
    expect(cls).toContain("max-w-(--lc-content-max-width)");
    expect(cls).not.toContain("max-w-250");
  });

  it("caps at 1000px when wide", () => {
    const cls = editorWrapperClassName(true, true);
    expect(cls).toContain("max-w-250");
    expect(cls).not.toContain("max-w-(--lc-content-max-width)");
  });

  it("only animates once the stored preference has loaded", () => {
    expect(editorWrapperClassName(true, false)).not.toContain(
      "transition-[max-width]",
    );
    expect(editorWrapperClassName(true, true)).toContain(
      "transition-[max-width]",
    );
  });

  it("always centres and fills the available width", () => {
    for (const wide of [true, false]) {
      const cls = editorWrapperClassName(wide, true);
      expect(cls).toContain("mx-auto");
      expect(cls).toContain("w-full");
    }
  });
});
