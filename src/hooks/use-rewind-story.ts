import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

export function useRewindStory(sceneCount: number) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const activeRef = useRef(activeIndex);
  const previousCount = useRef(sceneCount);
  activeRef.current = activeIndex;
  const reducedMotion = useReducedMotion();
  const animated = mounted && !reducedMotion;

  useEffect(() => setMounted(true), []);

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
        const track = root.querySelector<HTMLElement>("[data-replay-track]");
        if (track) track.scrollLeft = 0;
        const start = root.getBoundingClientRect().top + window.scrollY;
        const distance = root.offsetHeight - window.innerHeight;
        window.scrollTo({ top: start + (target / Math.max(1, sceneCount - 1)) * distance, behavior: "instant" });
      } else {
        const track = root.querySelector<HTMLElement>("[data-replay-track]");
        if (track) track.scrollTo({ left: target * track.clientWidth, behavior: "instant" });
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
    const track = rootRef.current?.querySelector<HTMLElement>("[data-replay-track]");
    if (!track) return;
    const update = () => setActiveIndex(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const scene = track.querySelectorAll<HTMLElement>("[data-replay-scene]")[activeRef.current];
      if (
        scene &&
        (event.deltaY > 0 ? scene.scrollTop + scene.clientHeight < scene.scrollHeight - 1 : scene.scrollTop > 0)
      )
        return;
      event.preventDefault();
      const step = Math.sign(event.deltaY);
      if (step) goTo(activeRef.current + step);
    };
    track.addEventListener("scroll", update, { passive: true });
    track.addEventListener("wheel", wheel, { passive: false });
    return () => {
      track.removeEventListener("scroll", update);
      track.removeEventListener("wheel", wheel);
    };
  }, [animated, goTo]);

  useEffect(() => {
    const resize = () => goTo(activeRef.current);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [goTo]);

  useEffect(() => {
    const navigate = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (
        event.target instanceof Element &&
        event.target.closest("input, select, textarea, button, a, summary, [contenteditable=true], [role=dialog]")
      )
        return;
      const target =
        event.key === "ArrowRight" ? activeRef.current + 1 : event.key === "ArrowLeft" ? activeRef.current - 1 : null;
      if (target === null) return;
      event.preventDefault();
      goTo(target);
    };
    window.addEventListener("keydown", navigate);
    return () => window.removeEventListener("keydown", navigate);
  }, [goTo]);

  return { rootRef, activeIndex, animated, onProgress, goTo };
}
