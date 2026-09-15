import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cancelScheduledCleanup,
  cleanupNow,
  scheduleCleanup,
} from "../cleanup";

/**
 * Covers the debounce around post-deletion purges. A purge scans every
 * document older than the cutoff, so its cost hardly depends on how much it
 * reclaims — folding a burst of deletions into one is the whole point.
 */

function fakeCollections() {
  const cleanup = vi.fn().mockResolvedValue(true);
  return {
    cleanup,
    collections: {
      topics: { cleanup } as never,
      entries: { cleanup } as never,
      blocks: { cleanup } as never,
    },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cancelScheduledCleanup();
  vi.useRealTimers();
});

describe("scheduleCleanup", () => {
  it("does not purge straight away", () => {
    const { cleanup, collections } = fakeCollections();

    scheduleCleanup(collections);

    expect(cleanup).not.toHaveBeenCalled();
  });

  it("purges every collection once the wait passes", async () => {
    const { cleanup, collections } = fakeCollections();

    scheduleCleanup(collections);
    await vi.runAllTimersAsync();

    // One call per collection, each purging regardless of age.
    expect(cleanup).toHaveBeenCalledTimes(3);
    expect(cleanup).toHaveBeenCalledWith(0);
  });

  it("folds a burst of deletions into a single purge", async () => {
    const { cleanup, collections } = fakeCollections();

    // Deleting a topic, then two entries, then another topic.
    for (let i = 0; i < 4; i++) {
      scheduleCleanup(collections);
      await vi.advanceTimersByTimeAsync(1000);
    }
    await vi.runAllTimersAsync();

    expect(cleanup).toHaveBeenCalledTimes(3);
  });

  it("purges again after the next deletion", async () => {
    const { cleanup, collections } = fakeCollections();

    scheduleCleanup(collections);
    await vi.runAllTimersAsync();
    scheduleCleanup(collections);
    await vi.runAllTimersAsync();

    expect(cleanup).toHaveBeenCalledTimes(6);
  });

  it("skips collections that are not ready", async () => {
    const { cleanup, collections } = fakeCollections();

    scheduleCleanup({ ...collections, blocks: null });
    await vi.runAllTimersAsync();

    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it("survives a failing purge, since the periodic one will try again", async () => {
    const { cleanup, collections } = fakeCollections();
    cleanup.mockRejectedValue(new Error("storage closed"));

    scheduleCleanup(collections);

    await expect(vi.runAllTimersAsync()).resolves.not.toThrow();
  });
});

describe("cleanupNow", () => {
  it("purges immediately, for the button in Settings → Storage", async () => {
    const { cleanup, collections } = fakeCollections();

    await cleanupNow(collections);

    expect(cleanup).toHaveBeenCalledTimes(3);
  });
});
