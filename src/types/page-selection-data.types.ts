export type PageData = {
  baseUri: string;
  HTML: string;
  language: string;
  title: string; // Title of the page
  location: {
    href: string;
    origin: string;
    pathname: string;
    search: string;
    hash: string;
  };
  //Todo: Add more fields if needed
};
