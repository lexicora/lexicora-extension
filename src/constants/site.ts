/**
 * The public website, on GitHub Pages for now. Every link to it goes through
 * this constant, so a custom domain later is a change here only. Shown only
 * where `FEATURES.WEBSITE` allows — see `features.ts`.
 */
export const WEBSITE_URL = "https://lexicora.github.io/";

/** The public source repository, where problems are reported. */
export const REPOSITORY_URL = "https://github.com/lexicora/lexicora-extension";

/**
 * Marks a link as coming from the extension, so a store's analytics can tell
 * where a visit started. `medium` names the place it was clicked, e.g. "about".
 *
 * For store listings only: the website collects no analytics, so its links
 * stay plain. Added to a link the user follows; nothing is sent until they
 * click.
 */
export function withUtm(url: string, medium: string): string {
  const tagged = new URL(url);
  tagged.searchParams.set("utm_source", "lexicora-extension");
  tagged.searchParams.set("utm_medium", medium);
  return tagged.href;
}

/**
 * The developer's contact address, the same one the store listings show. For
 * people without a GitHub account, and for questions that are not bugs.
 */
export const CONTACT_EMAIL = "hello@tgmaurer.dev";

/**
 * The extension's page in each browser's store, where it can be reviewed.
 * `where` reads after "on": "on the Chrome Web Store", "on Edge Add-ons".
 * `id` is the extension ID that store signs its copy with.
 */
export const STORE_LISTINGS = {
  chrome: {
    id: "ainigcpoeibgglaldkjippcccaicnjjd",
    where: "the Chrome Web Store",
    url: "https://chromewebstore.google.com/detail/ainigcpoeibgglaldkjippcccaicnjjd",
  },
  edge: {
    id: "cedcfjhhgnnhicanijilpadchcfkbjgl",
    where: "Edge Add-ons",
    url: "https://microsoftedge.microsoft.com/addons/detail/lexicora/cedcfjhhgnnhicanijilpadchcfkbjgl",
  },
  firefox: {
    id: null,
    where: "Firefox Add-ons",
    url: "https://addons.mozilla.org/addon/lexicora/",
  },
} as const;

export type StoreListing = (typeof STORE_LISTINGS)[keyof typeof STORE_LISTINGS];

/**
 * The store this copy of Lexicora was installed from.
 *
 * Chrome and Edge install the same build, so the build cannot say which store
 * it came from — but each store signs it with its own ID, which
 * `runtime.id` reports. That also sends someone who installed the Chrome Web
 * Store copy in Edge to the listing they actually used. An unpacked copy has
 * neither ID, and falls back to an Edge build, then the browser.
 */
export function currentStoreListing({
  extensionId,
  isFirefox,
  isEdgeBuild,
  userAgent,
}: {
  extensionId: string;
  isFirefox: boolean;
  isEdgeBuild: boolean;
  userAgent: string;
}): StoreListing {
  if (isFirefox) return STORE_LISTINGS.firefox;
  if (extensionId === STORE_LISTINGS.edge.id) return STORE_LISTINGS.edge;
  if (extensionId === STORE_LISTINGS.chrome.id) return STORE_LISTINGS.chrome;
  return isEdgeBuild || /\bEdg\//.test(userAgent)
    ? STORE_LISTINGS.edge
    : STORE_LISTINGS.chrome;
}
