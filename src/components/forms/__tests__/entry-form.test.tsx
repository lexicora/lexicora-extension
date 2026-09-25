import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EntryForm } from "../entry-form";

/**
 * What the form does beyond validation: a failed save takes the user to the
 * field that is wrong, and a bookmark opens the metadata it filled in.
 */

// React's act() needs to be told it runs in a test environment.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
// happy-dom lays nothing out, so there is no scrolling to observe.
const scrollIntoView = vi.fn();

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

async function render(element: React.ReactNode) {
  await act(async () => root.render(element));
}

async function submit() {
  const form = container.querySelector("form")!;
  await act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });
}

const isMetadataOpen = () => document.getElementById("tags") !== null;

describe("EntryForm", () => {
  it("takes a failed save to the missing topic", async () => {
    const onSubmit = vi.fn();
    await render(
      <EntryForm
        topics={[]}
        initialData={{ title: "A page" }}
        onSubmit={onSubmit}
      />,
    );

    await submit();

    const topic = document.getElementById("topicId");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: "center" }),
    );
    expect(scrollIntoView.mock.contexts[0]).toBe(topic);
    expect(document.activeElement).toBe(topic);
  });

  it("opens the metadata section when the field that is wrong is in it", async () => {
    await render(
      <EntryForm
        topics={[]}
        initialData={{ title: "A page", topicId: "Reading", url: "not a url" }}
        onSubmit={vi.fn()}
      />,
    );
    expect(isMetadataOpen()).toBe(false);

    await submit();

    expect(isMetadataOpen()).toBe(true);
    expect(document.activeElement).toBe(document.getElementById("url"));
  });

  it("opens the metadata section for every bookmark, the same one again too", async () => {
    const bookmark = { misc: { metadataOnly: true } };
    await render(
      <EntryForm topics={[]} onSubmit={vi.fn()} revealMetadataFor={bookmark} />,
    );
    expect(isMetadataOpen()).toBe(true);

    // The user collapses it, then bookmarks the same page again: identical
    // data, but a new capture.
    const trigger = [...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("Additional fields"),
    )!;
    await act(async () => trigger.click());
    expect(isMetadataOpen()).toBe(false);

    await render(
      <EntryForm
        topics={[]}
        onSubmit={vi.fn()}
        revealMetadataFor={{ misc: { metadataOnly: true } }}
      />,
    );
    expect(isMetadataOpen()).toBe(true);
  });
});
