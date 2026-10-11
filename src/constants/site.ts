/** The public website. Shown only where `FEATURES.WEBSITE` allows — see `features.ts`. */
export const WEBSITE_URL = "https://lexicora.com";

/** The public source repository, where problems are reported. */
export const REPOSITORY_URL = "https://github.com/lexicora/lexicora-extension";

/**
 * The developer's contact address, the same one the store listings show. For
 * people without a GitHub account, and for questions that are not bugs.
 */
export const CONTACT_EMAIL = "hello@tgmaurer.dev";

/**
 * The extension's page in each browser's store, where it can be reviewed.
 * `where` reads after "on": "on the Chrome Web Store", "on Edge Add-ons".
 */
export const STORE_LISTINGS = {
  chrome: {
    where: "the Chrome Web Store",
    url: "https://chromewebstore.google.com/detail/ainigcpoeibgglaldkjippcccaicnjjd",
  },
  edge: {
    where: "Edge Add-ons",
    url: "https://microsoftedge.microsoft.com/addons/detail/lexicora/cedcfjhhgnnhicanijilpadchcfkbjgl",
  },
  firefox: {
    where: "Firefox Add-ons",
    url: "https://addons.mozilla.org/addon/lexicora/",
  },
} as const;

/**
 * The store this copy of Lexicora came from. Edge is told apart at run time:
 * it installs the same build as Chrome, so `import.meta.env.EDGE` is not set.
 */
export function currentStoreListing(
  isFirefox: boolean,
  userAgent: string,
): (typeof STORE_LISTINGS)[keyof typeof STORE_LISTINGS] {
  if (isFirefox) return STORE_LISTINGS.firefox;
  return /\bEdg\//.test(userAgent) ? STORE_LISTINGS.edge : STORE_LISTINGS.chrome;
}
