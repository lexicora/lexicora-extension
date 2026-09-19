import { useCallback, useEffect } from "react";
import { cn } from "cn";
import { editorWideModeStorage } from "@/lib/storage/settings";
import { useAppStorage } from "@/hooks/use-app-storage";
import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * Below this viewport width the content column already fills the page, so a
 * wider editor has nothing to gain: the toggle is hidden and the preference
 * is ignored until the viewport grows again. 46rem is the 44rem content column
 * plus the page gutters.
 */
export const EDITOR_WIDE_MEDIA_QUERY = "(min-width: 46rem)";

/** Whether the viewport is wide enough for the wide editor to apply. */
export function useEditorWideAvailable() {
  return useMediaQuery(EDITOR_WIDE_MEDIA_QUERY);
}

/**
 * Props for the block that holds the editor on an entry page.
 *
 * Narrow: the block keeps the page gutter like every other block, so the
 * editor stays a contained field with a gap to the rest of the UI. Wide: the
 * gutter is dropped so the editor surface runs edge to edge across the content
 * area, and `data-editor-wide` switches on the wide-mode rules at the end of
 * editor/styles.css (no side borders, blocks capped and centred inside).
 *
 * The page container must opt out of its own gutter (`gutter={false}`) and
 * this block must sit directly inside it; see `.lc-page-gutter` in App.css.
 */
export function editorBleedProps(isWide: boolean, className?: string) {
  return {
    className: cn(!isWide && "lc-page-gutter", className) || undefined,
    "data-editor-wide": isWide ? "" : undefined,
  };
}

/**
 * Classes for the column inside the bleed block: the page's content column
 * when narrow, the full surface when wide (the cap then lives in the CSS).
 */
export function editorColumnClassName(isWide: boolean) {
  return cn("w-full", !isWide && "max-w-(--lc-content-max-width) mx-auto");
}

// Storage resolves asynchronously. Remembering the last value seen in this
// session lets the next entry page paint in the right layout straight away
// instead of narrow for a frame first.
let lastKnownWide: boolean | undefined;

/**
 * Persisted "wide editor" preference shared by the create, edit and detail
 * entry pages. `isWide` is the effective state: the preference only applies
 * while the viewport is wide enough (see `EDITOR_WIDE_MEDIA_QUERY`), so a
 * side panel dragged narrow shows the contained editor again on its own.
 */
export function useEditorWideMode() {
  const [stored, setStored] = useAppStorage(editorWideModeStorage);
  const isAvailable = useEditorWideAvailable();
  const prefersWide = stored ?? lastKnownWide ?? false;
  const isWide = prefersWide && isAvailable;

  useEffect(() => {
    if (stored !== undefined) lastKnownWide = stored;
  }, [stored]);

  const toggle = useCallback(() => {
    void setStored(!prefersWide);
  }, [prefersWide, setStored]);

  return { isWide, prefersWide, isAvailable, toggle };
}
