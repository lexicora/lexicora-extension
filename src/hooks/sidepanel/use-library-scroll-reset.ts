import { useLayoutEffect, useRef } from "react";
import { NavigationType, useLocation, useNavigationType } from "react-router";

/**
 * The library's list pages, which keep their own scroll position (Virtuoso
 * and sessionStorage) and update their URL while searching.
 */
export function isLibraryListPage(pathname: string): boolean {
  return (
    pathname === "/library" ||
    /^\/library\/topics\/[^/]+\/entries$/.test(pathname)
  );
}

/**
 * Scrolls to the top on arriving at a library page other than a list, as
 * `<ScrollRestoration />` does on every other page. That is left out under
 * /library for the lists' sake, so without this a page opened from a scrolled
 * list kept the list's scroll position whenever it rendered tall enough on
 * arrival — an entry opened a second time, with its content already loaded.
 *
 * Only on a new page: not on going back or forward, and not when only the
 * search changes.
 */
export function useLibraryScrollReset() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const previousPathname = useRef(pathname);

  useLayoutEffect(() => {
    const isNewPage = previousPathname.current !== pathname;
    previousPathname.current = pathname;
    if (!isNewPage || navigationType === NavigationType.Pop) return;
    if (!pathname.startsWith("/library") || isLibraryListPage(pathname))
      return;
    window.scrollTo(0, 0);
  }, [pathname, navigationType]);
}
