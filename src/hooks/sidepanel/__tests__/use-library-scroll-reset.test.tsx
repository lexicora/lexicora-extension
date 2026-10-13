import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isLibraryListPage,
  useLibraryScrollReset,
} from "@/hooks/sidepanel/use-library-scroll-reset";

/**
 * A page under /library opened from a scrolled list once kept the list's
 * scroll position. These cover when the hook scrolls to the top, and when it
 * leaves the scroll position to the lists.
 */

// React's act() needs to be told it runs in a test environment.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
const scrollTo = vi.fn();

function Layout() {
  useLibraryScrollReset();
  return <Outlet />;
}

async function renderAt(path: string) {
  const router = createMemoryRouter(
    [{ path: "/", element: <Layout />, children: [{ path: "*" }] }],
    { initialEntries: [path] },
  );
  await act(async () => root.render(<RouterProvider router={router} />));
  scrollTo.mockClear();
  return router;
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  window.scrollTo = scrollTo as typeof window.scrollTo;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("useLibraryScrollReset", () => {
  it("scrolls to the top on opening an entry from the library", async () => {
    const router = await renderAt("/library");
    await act(() => router.navigate("/library/entries/a"));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("scrolls to the top on opening the same entry again", async () => {
    const router = await renderAt("/library");
    await act(() => router.navigate("/library/entries/a"));
    await act(() => router.navigate(-1));
    scrollTo.mockClear();
    await act(() => router.navigate("/library/entries/a"));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("leaves going back to the list, which restores its own place", async () => {
    const router = await renderAt("/library");
    await act(() => router.navigate("/library/entries/a"));
    scrollTo.mockClear();
    await act(() => router.navigate(-1));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("leaves a list page's search alone", async () => {
    const router = await renderAt("/library");
    await act(() => router.navigate("/library?q=notes", { replace: true }));
    await act(() => router.navigate("/library/topics/t/entries"));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("leaves pages outside the library to ScrollRestoration", async () => {
    const router = await renderAt("/");
    await act(() => router.navigate("/settings"));
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe("isLibraryListPage", () => {
  it("tells the lists from the other library pages", () => {
    expect(isLibraryListPage("/library")).toBe(true);
    expect(isLibraryListPage("/library/topics/t/entries")).toBe(true);
    expect(isLibraryListPage("/library/entries/a")).toBe(false);
    expect(isLibraryListPage("/library/topics/t")).toBe(false);
    expect(isLibraryListPage("/library/entries/new")).toBe(false);
  });
});
