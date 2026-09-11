export const UNSUPPORTED_URL_REGEX =
  /\.pdf(\?|$)|chrome\.google\.com\/webstore|chromewebstore\.google\.com|addons\.mozilla\.org|microsoftedge\.microsoft\.com/i;
//was: /\.pdf(\?|$)|chrome\.google\.com\/webstore|chromewebstore\.google\.com|addons\.mozilla\.org/i;

//const UNSUPPORTED_URL_REGEX = /\.pdf(\?|$)/i; // Currently excludes: *.pdf*
//const UNSUPPORTED_URL_REGEX = /\.pdf(\?|$)|^(about|chrome|edge|browser|resource):/i;

export const SUPPORTED_URL_REGEX = /^(https?|file):\/\/(\*|\/)?.*$/;

/** Whether a page can be captured: http(s) or file, and not on the blocklist. */
export function isCapturableUrl(url: string | undefined): boolean {
  if (!url) return false;
  return SUPPORTED_URL_REGEX.test(url) && !UNSUPPORTED_URL_REGEX.test(url);
}
