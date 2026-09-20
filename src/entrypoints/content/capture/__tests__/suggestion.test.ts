import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

import { sidePanelStateStorage } from "@/lib/storage/settings";

/**
 * Covers when the capture prompt is allowed to appear.
 *
 * The prompt suggests opening the side panel, so it must never arrive next to
 * a panel that is already open — including the case the delay makes easy to
 * hit: the panel is opened while the countdown is running.
 *
 * The shadow-root UI is mocked away; what matters here is whether it is
 * mounted at all, not what it renders.
 */

const mount = vi.fn();
const remove = vi.fn();

vi.mock("wxt/utils/content-script-ui/shadow-root", () => ({
  createShadowRootUi: vi.fn(async () => ({ mount, remove })),
}));
vi.mock("@fontsource/wix-madefor-text/400.css", () => ({}));
vi.mock("@fontsource/wix-madefor-text/500.css", () => ({}));

const { setupCaptureSuggestion } = await import("../suggestion");

/** Only the parts of the content-script context the prompt uses. */
const context = () =>
  ({
    addEventListener: vi.fn(),
    setInterval: vi.fn(),
    onInvalidated: vi.fn(),
  }) as never;

/**
 * The default delay: the multiplier of five times the base, which is one
 * second in a dev build (tests run as one) and one minute otherwise.
 */
const DELAY_MS = 5 * (import.meta.env.DEV ? 1_000 : 60_000);

/**
 * Lets the storage reads resolve. `advanceTimersByTimeAsync` runs the
 * microtasks between timers, which the prompt's awaits sit in.
 */
const flush = () => vi.advanceTimersByTimeAsync(0);

beforeEach(async () => {
  fakeBrowser.reset();
  vi.clearAllMocks();
  vi.useFakeTimers();
  window.location.href = "https://example.com/article";
});

afterEach(() => {
  vi.useRealTimers();
});

describe("capture suggestion prompt", () => {
  it("appears once the delay has passed with the panel closed", async () => {
    await setupCaptureSuggestion(context());
    await flush();

    await vi.advanceTimersByTimeAsync(DELAY_MS);
    await flush();

    expect(mount).toHaveBeenCalled();
  });

  it("does not appear when the panel is opened while the delay runs", async () => {
    await setupCaptureSuggestion(context());
    await flush();

    // Halfway through the countdown the user opens the panel themselves.
    await vi.advanceTimersByTimeAsync(DELAY_MS / 2);
    await sidePanelStateStorage.setValue(true);
    await flush();

    await vi.advanceTimersByTimeAsync(DELAY_MS);
    await flush();

    expect(mount).not.toHaveBeenCalled();
  });

  it("takes a prompt already on screen away when the panel opens", async () => {
    await setupCaptureSuggestion(context());
    await flush();

    await vi.advanceTimersByTimeAsync(DELAY_MS);
    await flush();
    expect(mount).toHaveBeenCalled();

    await sidePanelStateStorage.setValue(true);
    await flush();

    expect(remove).toHaveBeenCalled();
  });

  it("starts the countdown again when the panel is closed", async () => {
    await sidePanelStateStorage.setValue(true);
    await setupCaptureSuggestion(context());
    await flush();

    await vi.advanceTimersByTimeAsync(DELAY_MS);
    await flush();
    expect(mount).not.toHaveBeenCalled();

    await sidePanelStateStorage.setValue(false);
    await flush();
    await vi.advanceTimersByTimeAsync(DELAY_MS);
    await flush();

    expect(mount).toHaveBeenCalled();
  });
});
