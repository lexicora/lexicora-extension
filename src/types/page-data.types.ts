export type PageData = {
  /** BaseUri of the page */
  baseUri: string;
  /** The main content of the page (HTML) */
  content: string;
  /** The main content of the page (text) */
  textContent?: string;
  /** The language of the page */
  lang: string;
  /** The title of the page */
  title: string;
  /** The location data of the page */
  location: {
    href: string;
    //origin: string;
    hostname: string;
    pathname: string;
    search: string;
    hash: string;
  };
  /** Metadata of the page */
  metadata: {
    length: number;
    excerpt: string | null;
    byline: string | null;
    siteName: string | null;
    publishedTime: string | null;
    faviconUrl?: string | null;
    dir?: string | null; // Text direction (e.g., "ltr", "rtl", "auto")
  };
  misc: {
    overrideExisting: boolean; // Whether to replace the existing editor content and form data with the parsed content
  };
  //Todo: Add more fields if needed
};
