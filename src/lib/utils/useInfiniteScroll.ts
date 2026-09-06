import { useEffect, useRef } from "react";

export function useInfiniteScroll(onIntersect: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onIntersect);

  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callbackRef.current();
      },
      { rootMargin: "400px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
}
