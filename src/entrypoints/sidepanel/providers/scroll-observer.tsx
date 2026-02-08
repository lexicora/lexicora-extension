import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";

interface ScrollState {
  isAtTop: boolean;
  isAtBottom: boolean;
}

const ScrollContext = createContext<ScrollState>({
  isAtTop: true,
  isAtBottom: false,
});

interface ScrollProviderProps {
  children: ReactNode;
}

export function ScrollObserverProvider({ children }: ScrollProviderProps) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    isAtTop: true, //typeof window !== "undefined" ? window.scrollY < 10 : true //maybe change to false
    isAtBottom: false,
  });

  // Explicitly type the Refs as HTMLDivElements
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isTopTarget = entry.target === topRef.current;

          setScrollState((prev) => ({
            ...prev,
            [isTopTarget ? "isAtTop" : "isAtBottom"]: entry.isIntersecting,
          }));
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
    <ScrollContext.Provider value={scrollState}>
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
    </ScrollContext.Provider>
  );
}

export const useScrollPos = () => useContext(ScrollContext);
