export const UNSUPPORTED_URL_REGEX =
  /\.pdf(\?|$)|chrome\.google\.com\/webstore|chromewebstore\.google\.com|addons\.mozilla\.org|microsoftedge\.microsoft\.com/i;
//was: /\.pdf(\?|$)|chrome\.google\.com\/webstore|chromewebstore\.google\.com|addons\.mozilla\.org/i;

//const UNSUPPORTED_URL_REGEX = /\.pdf(\?|$)/i; // Currently excludes: *.pdf*
//const UNSUPPORTED_URL_REGEX = /\.pdf(\?|$)|^(about|chrome|edge|browser|resource):/i;

/**
 * An extension's own pages, in every browser that runs this one.
 *
 * The side panel is one of these, and toggling the panel from inside it has
 * nothing to act on: such a click reports no window (`windowId` -1), which
 * `sidePanel.open` rejects outright.
 */
export const EXTENSION_PAGE_REGEX =
  /^(?:chrome|moz|safari-web|ms-browser)?-?extension:\/\//i;

/** Whether a URL is a page belonging to an extension. */
export function isExtensionPage(url: string | undefined): boolean {
  return !!url && EXTENSION_PAGE_REGEX.test(url);
}

export const SUPPORTED_URL_REGEX = /^(https?|file):\/\/(\*|\/)?.*$/;

/** Whether a page can be captured: http(s) or file, and not on the blocklist. */
export function isCapturableUrl(url: string | undefined): boolean {
  if (!url) return false;
  return SUPPORTED_URL_REGEX.test(url) && !UNSUPPORTED_URL_REGEX.test(url);
}
