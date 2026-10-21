import { useEffect, useRef, useState } from "react";

export function useInfiniteScroll(onIntersect: () => void, enabled: boolean) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const callbackRef = useRef(onIntersect);

  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    if (!element || !enabled) return;

    let active = true;

    const observer = new IntersectionObserver(
      (entries) => {
        if (active && entries.some((entry) => entry.isIntersecting)) callbackRef.current();
      },
      { rootMargin: "400px 0px", threshold: 0 },
    );

    observer.observe(element);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [element, enabled]);

  return setElement;
}
