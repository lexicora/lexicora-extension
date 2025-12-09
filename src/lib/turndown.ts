import TurndownService from "turndown";

// create one reusable instance for this module
/**
 * Turndown service instance with custom options.
 */
const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    fence: "```",
    emDelimiter: "_", // maybe change to "*" later
    strongDelimiter: "**",
    linkStyle: "inlined",
    //linkReferenceStyle: "full",
});

// Change to optimal, for example what AI models prefer

export default turndownService;