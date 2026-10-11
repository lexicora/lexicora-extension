/**
 * The getting-started page: one tab, shown once on install and reachable
 * afterwards from Settings → Help. Not a flow — it explains where things are
 * and hands over to the side panel.
 */

/** The unlisted page WXT builds from `entrypoints/onboarding/`. */
export const ONBOARDING_PATH = "/onboarding.html";

/**
 * Marks the tab opened on install. The browser opens its Extensions menu at
 * the same moment, offering to pin Lexicora, and that menu covers the page's
 * own arrow to it — so the page leaves the arrow out there, and keeps it for
 * when it is opened again from Settings, where no menu shows.
 */
export const INSTALL_SEARCH_PARAM = "installed";

export function onboardingUrl({ onInstall = false } = {}): string {
  const url = browser.runtime.getURL(ONBOARDING_PATH);
  return onInstall ? `${url}?${INSTALL_SEARCH_PARAM}` : url;
}

/** Whether this page was opened by the install, rather than from Settings. */
export function isOnboardingFromInstall(search: string): boolean {
  return new URLSearchParams(search).has(INSTALL_SEARCH_PARAM);
}

/**
 * Opens the page on a fresh install only — never on an update, a browser
 * update or a reload of the extension, when a tab nobody asked for is noise.
 */
export async function openOnboardingOnInstall(reason: string): Promise<void> {
  if (reason !== "install") return;
  await browser.tabs.create({ url: onboardingUrl({ onInstall: true }) });
}
