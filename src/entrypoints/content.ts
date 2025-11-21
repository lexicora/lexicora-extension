export default defineContentScript({
  //matches: ['*://*.google.com/*'],
  matches: ['<all_urls>'],
  excludeMatches: [], // Todo: add browser pages or specific URLs to exclude here
  main() {
    console.log('Hello content.');
  },
});
