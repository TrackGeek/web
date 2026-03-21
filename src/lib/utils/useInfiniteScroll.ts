import { useCallback, useEffect, useRef } from "react";

export function useInfiniteScroll(onIntersect: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);

  const callback = useCallback(onIntersect, [onIntersect]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) {
      hasTriggered.current = false;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          callback();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [callback, enabled]);

  return ref;
}
