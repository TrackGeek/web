import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

export function useRewindStory(sceneCount: number) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [readMode, setReadMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shortScreen, setShortScreen] = useState(false);
  const activeRef = useRef(activeIndex);
  const previousCount = useRef(sceneCount);
  activeRef.current = activeIndex;
  const reducedMotion = useReducedMotion();
  const motionAvailable = mounted && !reducedMotion && !shortScreen;
  const animated = motionAvailable && !readMode;

  useEffect(() => {
    const query = window.matchMedia("(max-height: 560px), (max-width: 640px) and (max-height: 740px)");
    const update = () => setShortScreen(query.matches);
    update();
    query.addEventListener("change", update);
    setMounted(true);
    return () => query.removeEventListener("change", update);
  }, []);

  const onProgress = useCallback(
    (progress: number) => {
      if (animated) setActiveIndex(Math.round(progress * (sceneCount - 1)));
    },
    [animated, sceneCount],
  );

  const goTo = useCallback(
    (index: number) => {
      const root = rootRef.current;
      if (!root) return;
      const target = Math.max(0, Math.min(sceneCount - 1, index));

      if (animated) {
        const start = root.getBoundingClientRect().top + window.scrollY;
        const distance = root.offsetHeight - window.innerHeight;
        window.scrollTo({ top: start + (target / (sceneCount - 1)) * distance, behavior: "instant" });
      } else {
        root.querySelectorAll<HTMLElement>("[data-replay-scene]")[target]?.scrollIntoView({ behavior: "instant" });
      }

      setActiveIndex(target);
    },
    [animated, sceneCount],
  );

  useEffect(() => {
    const target = previousCount.current === sceneCount ? activeRef.current : 0;
    previousCount.current = sceneCount;
    const frame = requestAnimationFrame(() => goTo(target));
    return () => cancelAnimationFrame(frame);
  }, [sceneCount, goTo]);

  useEffect(() => {
    if (animated) return;
    const scenes = rootRef.current?.querySelectorAll<HTMLElement>("[data-replay-scene]");
    if (!scenes) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveIndex(Number((entry.target as HTMLElement).dataset.replayScene));
        }
      },
      { threshold: 0, rootMargin: "-40% 0px -40% 0px" },
    );
    for (const scene of Array.from(scenes).slice(0, sceneCount)) observer.observe(scene);
    return () => observer.disconnect();
  }, [animated, sceneCount]);

  return { rootRef, activeIndex, animated, motionAvailable, onProgress, readMode, setReadMode, goTo };
}
