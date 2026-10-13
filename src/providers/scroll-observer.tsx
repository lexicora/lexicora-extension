import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

// One context per flag: a component re-renders only when the one it reads
// changes. Leaving the top re-rendered every reader of the bottom as well, and
// with it whole pages, such as the editor's, right as scrolling began.
const AtTopContext = createContext(true);
const AtBottomContext = createContext(false);

interface ScrollProviderProps {
  children: ReactNode;
}

export function ScrollObserverProvider({ children }: ScrollProviderProps) {
  const [isAtTop, setIsAtTop] = useState(true); //typeof window !== "undefined" ? window.scrollY < 10 : true //maybe change to false
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Explicitly type the Refs as HTMLDivElements
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === topRef.current) {
            setIsAtTop(entry.isIntersecting);
          } else {
            setIsAtBottom(entry.isIntersecting);
          }
        });
      },
      { threshold: 0.1 },
    );

    const tRef = topRef.current;
    const bRef = bottomRef.current;

    if (tRef) observer.observe(tRef);
    if (bRef) observer.observe(bRef);

    return () => {
      if (tRef) observer.unobserve(tRef);
      if (bRef) observer.unobserve(bRef);
      observer.disconnect();
    };
  }, []);

  return (
    <AtTopContext.Provider value={isAtTop}>
      <AtBottomContext.Provider value={isAtBottom}>
        {/* Sentinel Top */}
        <div
          ref={topRef}
          className="h-px w-full pointer-events-none"
          aria-hidden="true"
        />

        {children}

        {/* Sentinel Bottom */}
        <div
          ref={bottomRef}
          className="h-px w-full pointer-events-none"
          aria-hidden="true"
        />
      </AtBottomContext.Provider>
    </AtTopContext.Provider>
  );
}

/** Whether the page is scrolled to its top. */
export const useIsAtTop = () => useContext(AtTopContext);

/** Whether the page is scrolled to its bottom. */
export const useIsAtBottom = () => useContext(AtBottomContext);
