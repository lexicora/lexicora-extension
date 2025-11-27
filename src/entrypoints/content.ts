export default defineContentScript({
  //matches: ['*://*.google.com/*'],
  matches: ['<all_urls>'],
  excludeMatches: import.meta.env.FIREFOX 
    ? ["about:*"]
    : [],
  main() {
    console.log('Hello content.');
  },
});