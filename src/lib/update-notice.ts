import { storage } from "wxt/utils/storage";

/**
 * The one-time "Lexicora was updated" toast in the side panel.
 *
 * The background notes the version it updated from when the browser installs
 * a new one, and the next side panel to open shows the toast and clears the
 * note, so it appears once and only where the user is looking. No tab is
 * opened for it, as one is on install: an update is not worth interrupting
 * the page someone is reading.
 *
 * Local, not synced: each browser updates on its own schedule.
 */
export const pendingUpdateNoticeStorage = storage.defineItem<string | null>(
  "local:app-state-update-notice-from",
  { fallback: null },
);

/**
 * Remembers an update for the side panel to announce. Only a real version
 * change counts: reloading an unpacked extension also reports "update", with
 * the same version on both sides.
 */
export async function recordUpdate(
  reason: string,
  previousVersion: string | undefined,
  currentVersion = browser.runtime.getManifest().version,
): Promise<void> {
  if (reason !== "update" || !previousVersion) return;
  if (previousVersion === currentVersion) return;
  await pendingUpdateNoticeStorage.setValue(previousVersion);
}

/**
 * The version updated from, if an update has not been announced yet, and
 * marks it announced: cleared as soon as it is read, so a panel in another
 * window, or the next one opened, does not show it again.
 */
export async function takePendingUpdateNotice(): Promise<string | null> {
  const previousVersion = await pendingUpdateNoticeStorage.getValue();
  if (previousVersion === null) return null;
  await pendingUpdateNoticeStorage.removeValue();
  return previousVersion;
}
