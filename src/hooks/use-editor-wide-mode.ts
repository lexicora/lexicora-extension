import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { editorWideModeStorage } from "@/lib/storage/settings";
import { useAppStorage } from "@/hooks/use-app-storage";

/**
 * Classes for the div that wraps the BlockNote editor on the entry pages. Wide
 * mode swaps the page's content column width for a 1000px cap; the side margins
 * come from the page container's own padding, so nothing else needs to move.
 *
 * `animate` is false until the stored preference has loaded, so a user with
 * wide mode on does not watch the editor grow on every page open.
 */
export function editorWrapperClassName(isWide: boolean, animate: boolean) {
  return cn(
    "mx-auto w-full",
    isWide ? "max-w-250" : "max-w-(--lc-content-max-width)",
    animate && "transition-[max-width] duration-200",
  );
}

/**
 * Persisted "wide editor" preference shared by the create, edit and detail
 * entry pages. The first render reports narrow until storage resolves.
 */
export function useEditorWideMode() {
  const [stored, setStored] = useAppStorage(editorWideModeStorage);
  const isLoaded = stored !== undefined;
  const isWide = stored === true;

  // Flip to animated one render after the value arrives, so the load itself
  // is not animated but every toggle after it is.
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (isLoaded) setAnimate(true);
  }, [isLoaded]);

  const toggle = useCallback(() => {
    void setStored(!isWide);
  }, [isWide, setStored]);

  return {
    isWide,
    isLoaded,
    toggle,
    wrapperClassName: editorWrapperClassName(isWide, animate),
  };
}
