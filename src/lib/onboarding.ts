/**
 * The getting-started page: one tab, shown once on install and reachable
 * afterwards from Settings → Help. Not a flow — it explains where things are
 * and hands over to the side panel.
 */

/** The unlisted page WXT builds from `entrypoints/onboarding/`. */
export const ONBOARDING_PATH = "/onboarding.html";

export function onboardingUrl(): string {
  return browser.runtime.getURL(ONBOARDING_PATH);
}

/**
 * Opens the page on a fresh install only — never on an update, a browser
 * update or a reload of the extension, when a tab nobody asked for is noise.
 */
export async function openOnboardingOnInstall(reason: string): Promise<void> {
  if (reason !== "install") return;
  await browser.tabs.create({ url: onboardingUrl() });
}
