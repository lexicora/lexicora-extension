export const UNSUPPORTED_URL_REGEX =
  /\.pdf(\?|$)|chrome\.google\.com\/webstore|chromewebstore\.google\.com|addons\.mozilla\.org|microsoftedge\.microsoft\.com/i;
//was: /\.pdf(\?|$)|chrome\.google\.com\/webstore|chromewebstore\.google\.com|addons\.mozilla\.org/i;

//const UNSUPPORTED_URL_REGEX = /\.pdf(\?|$)/i; // Currently excludes: *.pdf*
//const UNSUPPORTED_URL_REGEX = /\.pdf(\?|$)|^(about|chrome|edge|browser|resource):/i;

export const SUPPORTED_URL_REGEX = /^(https?|file):\/\/(\*|\/)?.*$/;
