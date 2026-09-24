/**
 * A copy of the page as the reader sees it, shadow DOM included.
 *
 * `document.cloneNode(true)` copies only the light DOM. Pages built from web
 * components render their content inside shadow roots — MDN's code examples,
 * Reddit's posts, design-system docs — and a plain clone has them empty, so a
 * capture lost exactly that content. This clones the page, then fills each
 * shadow host in the copy with what its shadow root renders, `<slot>`s
 * replaced by the light children assigned to them: the composed tree, as it
 * is laid out on screen.
 *
 * It reads the live page, not the copy, so each host's computed style is at
 * hand: hosts that are hidden or fixed over the page (consent banners, chat
 * widgets) keep their light DOM only, as before, rather than adding their
 * interface to the capture.
 */

type ShadowReader = (element: Element) => ShadowRoot | null;

/**
 * The element's shadow root, open or closed. Extensions may read closed ones:
 * Firefox gives content scripts `openOrClosedShadowRoot`, Chromium has
 * `chrome.dom.openOrClosedShadowRoot`. Elsewhere, open roots only.
 */
const defaultShadowReader: ShadowReader = (element) => {
  const firefox = (
    element as Element & { openOrClosedShadowRoot?: ShadowRoot | null }
  ).openOrClosedShadowRoot;
  if (firefox !== undefined) return firefox ?? null;

  const chromeDom = (
    globalThis as {
      chrome?: {
        dom?: { openOrClosedShadowRoot?: (el: Element) => ShadowRoot | null };
      };
    }
  ).chrome?.dom?.openOrClosedShadowRoot;
  if (chromeDom) {
    try {
      return chromeDom(element) ?? null;
    } catch {
      // Not an element it accepts; fall through to the open root.
    }
  }
  return element.shadowRoot;
};

/** A host whose rendering belongs in a capture. */
function isContentHost(host: Element): boolean {
  const view = host.ownerDocument.defaultView;
  if (!view) return true;
  const style = view.getComputedStyle(host);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.position !== "fixed"
  );
}

/**
 * The live node as it renders, copied into `doc`: a shadow host's copy holds
 * its shadow root's content, and a slot becomes the nodes assigned to it, or
 * its fallback content when nothing is.
 */
function composeNode(
  node: Node,
  doc: Document,
  readShadow: ShadowReader,
): Node[] {
  if (node.nodeType !== Node.ELEMENT_NODE) return [doc.importNode(node, false)];
  const element = node as Element;

  if (element.localName === "slot") {
    const assigned = (element as HTMLSlotElement).assignedNodes({
      flatten: true,
    });
    const source = assigned.length > 0 ? assigned : [...element.childNodes];
    return source.flatMap((child) => composeNode(child, doc, readShadow));
  }

  const copy = doc.importNode(element, false);
  copy.append(...composedChildren(element, doc, readShadow));
  return [copy];
}

/** What renders inside an element: its shadow root if it is a content host. */
function composedChildren(
  element: Element,
  doc: Document,
  readShadow: ShadowReader,
): Node[] {
  const root = readShadow(element);
  const children =
    root && isContentHost(element) ? root.childNodes : element.childNodes;
  return [...children].flatMap((child) => composeNode(child, doc, readShadow));
}

/**
 * Clones `live` with its shadow DOM composed in. A page without shadow hosts
 * costs one clone and one pass over its elements, as before plus the pass.
 */
export function cloneComposedDocument(
  live: Document,
  readShadow: ShadowReader = defaultShadowReader,
): Document {
  const clone = live.cloneNode(true) as Document;

  // The clone matches the live page element for element, in document order,
  // until a host is filled in; hosts are found first, then filled.
  const liveElements = live.querySelectorAll("*");
  const cloneElements = clone.querySelectorAll("*");
  const hosts: Array<[live: Element, copy: Element]> = [];
  liveElements.forEach((element, index) => {
    if (readShadow(element) && isContentHost(element)) {
      hosts.push([element, cloneElements[index]!]);
    }
  });

  for (const [host, copy] of hosts) {
    // Inside a host filled in already: composed along with it.
    if (!clone.contains(copy)) continue;
    copy.replaceChildren(...composedChildren(host, clone, readShadow));
  }
  return clone;
}
