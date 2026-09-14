import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * The measured height of an element, kept current as it resizes.
 *
 * Meant for a flex child that takes the space left over (`flex-1 min-h-0`) and
 * clips its content: its height then depends on the layout around it, never on
 * what is rendered inside, so using the measurement to decide what to render
 * cannot feed back into itself.
 */
export function useAvailableHeight(ref: RefObject<HTMLElement | null>): number {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    setHeight(element.getBoundingClientRect().height);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setHeight(entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return height;
}
