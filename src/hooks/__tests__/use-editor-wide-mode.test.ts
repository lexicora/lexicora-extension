import { describe, it, expect } from "vitest";
import {
  editorBleedProps,
  editorColumnClassName,
} from "../use-editor-wide-mode";

describe("editorBleedProps", () => {
  it("keeps the page gutter and no wide attribute when narrow", () => {
    const props = editorBleedProps(false);
    expect(props.className).toBe("lc-page-gutter");
    expect(props["data-editor-wide"]).toBeUndefined();
  });

  it("drops the gutter and marks the block wide", () => {
    const props = editorBleedProps(true);
    expect(props.className).toBeUndefined();
    expect(props["data-editor-wide"]).toBe("");
  });

  it("merges extra classes in both states", () => {
    expect(editorBleedProps(false, "mt-2").className).toBe(
      "lc-page-gutter mt-2",
    );
    expect(editorBleedProps(true, "mt-2").className).toBe("mt-2");
  });
});

describe("editorColumnClassName", () => {
  it("uses the page content column when narrow", () => {
    const cls = editorColumnClassName(false);
    expect(cls).toContain("max-w-(--lc-content-max-width)");
    expect(cls).toContain("mx-auto");
    expect(cls).toContain("w-full");
  });

  it("fills the surface when wide, leaving the cap to the CSS", () => {
    const cls = editorColumnClassName(true);
    expect(cls).toBe("w-full");
  });
});
