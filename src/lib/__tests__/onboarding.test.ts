import { describe, it, expect, vi, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

import {
  isOnboardingFromInstall,
  onboardingUrl,
  openOnboardingOnInstall,
  ONBOARDING_PATH,
} from "../onboarding";

/**
 * The getting-started tab opens once, on a fresh install. An update or a
 * reload that opened it again would be a tab nobody asked for.
 */

let tabsCreate: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fakeBrowser.reset();
  tabsCreate = vi.fn(async () => ({}));
  vi.spyOn(browser.tabs, "create").mockImplementation(tabsCreate as never);
});

describe("openOnboardingOnInstall", () => {
  it("opens the page on install", async () => {
    await openOnboardingOnInstall("install");

    expect(tabsCreate).toHaveBeenCalledOnce();
    expect(tabsCreate.mock.calls[0]![0].url).toContain(ONBOARDING_PATH);
  });

  it("marks the tab as opened by the install", async () => {
    // The page leaves its toolbar arrow out then: the browser's own
    // Extensions menu is open over it, already offering to pin.
    await openOnboardingOnInstall("install");

    const url = new URL(tabsCreate.mock.calls[0]![0].url as string);
    expect(isOnboardingFromInstall(url.search)).toBe(true);
  });

  it.each([
    "update",
    "chrome_update",
    "browser_update",
    "shared_module_update",
  ])("stays closed on %s", async (reason) => {
    await openOnboardingOnInstall(reason);

    expect(tabsCreate).not.toHaveBeenCalled();
  });
});

describe("isOnboardingFromInstall", () => {
  it("is false for the page opened from Settings", () => {
    expect(isOnboardingFromInstall(new URL(onboardingUrl()).search)).toBe(false);
  });
});
