import { describe, it, expect } from "vitest";
import { captureFailureMessage } from "@/hooks/sidepanel/capture-failure-listener";

describe("captureFailureMessage", () => {
  it("says bookmarked when a bookmark is what failed", () => {
    expect(captureFailureMessage("unsupported", "bookmark")).toBe(
      "This page can't be bookmarked",
    );
    expect(captureFailureMessage("unsupported", "page")).toBe(
      "This page can't be captured",
    );
    expect(captureFailureMessage("unsupported", "auto")).toBe(
      "This page can't be captured",
    );
  });

  it("keeps the reasons that already name the action", () => {
    expect(captureFailureMessage("no-selection", "page")).toBe(
      "Nothing is selected on the page",
    );
    expect(captureFailureMessage("unreachable", "bookmark")).toBe(
      captureFailureMessage("unreachable", "page"),
    );
  });
});
