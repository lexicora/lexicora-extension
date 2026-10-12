import { describe, it, expect, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

import {
  pendingUpdateNoticeStorage,
  recordUpdate,
  takePendingUpdateNotice,
} from "../update-notice";

/**
 * After an update the side panel says so once. Anything other than a real
 * version change — an install, a browser update, reloading the unpacked
 * extension — must leave it quiet.
 */

beforeEach(() => {
  fakeBrowser.reset();
});

describe("recordUpdate", () => {
  it("remembers the version updated from", async () => {
    await recordUpdate("update", "1.0.2", "1.1.0");

    expect(await pendingUpdateNoticeStorage.getValue()).toBe("1.0.2");
  });

  it("ignores a reload that keeps the version", async () => {
    await recordUpdate("update", "1.1.0", "1.1.0");

    expect(await pendingUpdateNoticeStorage.getValue()).toBeNull();
  });

  it.each(["install", "chrome_update", "browser_update"])(
    "ignores %s",
    async (reason) => {
      await recordUpdate(reason, "1.0.2", "1.1.0");

      expect(await pendingUpdateNoticeStorage.getValue()).toBeNull();
    },
  );

  it("ignores an update without a previous version", async () => {
    await recordUpdate("update", undefined, "1.1.0");

    expect(await pendingUpdateNoticeStorage.getValue()).toBeNull();
  });
});

describe("takePendingUpdateNotice", () => {
  it("returns the notice once", async () => {
    await recordUpdate("update", "1.0.2", "1.1.0");

    expect(await takePendingUpdateNotice()).toBe("1.0.2");
    expect(await takePendingUpdateNotice()).toBeNull();
  });

  it("is empty when nothing was updated", async () => {
    expect(await takePendingUpdateNotice()).toBeNull();
  });
});
