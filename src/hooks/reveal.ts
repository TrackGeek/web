import { animate, stagger } from "animejs";
import { useEffect, useRef } from "react";

type AnimateParams = Parameters<typeof animate>[1];

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type RevealOptions = {
  selector?: string;
  x?: number;
  y?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  step?: number;
  threshold?: number;
  rootMargin?: string;
};

export function useReveal<T extends HTMLElement = HTMLDivElement>({
  selector = "[data-reveal]",
  x = 0,
  y = 28,
  scale = 1,
  duration = 900,
  delay = 0,
  step = 90,
  threshold = 0.15,
  rootMargin = "0px 0px -80px 0px",
}: RevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;

    if (!root) return;

    const found = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const targets = found.length > 0 ? found : [root];

    const settle = () => {
      for (const target of targets) {
        target.style.opacity = "1";
      }
    };

    if (prefersReducedMotion()) {
      settle();

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        observer.disconnect();

        const params: Record<string, unknown> = {
          opacity: [0, 1],
          duration,
          delay: stagger(step, { start: delay }),
          ease: "outExpo",
        };

        if (x !== 0) params.translateX = [x, 0];
        if (y !== 0) params.translateY = [y, 0];
        if (scale !== 1) params.scale = [scale, 1];

        animate(targets, params as AnimateParams);
      },
      { threshold, rootMargin },
    );

    observer.observe(root);

    return () => observer.disconnect();
  }, [selector, x, y, scale, duration, delay, step, threshold, rootMargin]);

  return ref;
}

export function usePointerParallax<T extends HTMLElement = HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;

    if (!root || !enabled || prefersReducedMotion()) return;

    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-depth]"));

    if (layers.length === 0) return;

    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      const offsetX = event.clientX / window.innerWidth - 0.5;
      const offsetY = event.clientY / window.innerHeight - 0.5;

      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        for (const layer of layers) {
          const depth = Number(layer.dataset.depth ?? 0);

          layer.style.transform = `translate3d(${(offsetX * depth).toFixed(2)}px, ${(offsetY * depth).toFixed(2)}px, 0)`;
        }
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return ref;
}

export function useSpotlight<T extends HTMLElement = HTMLElement>(selector = "[data-spotlight]") {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;

    if (!root) return;

    const onPointerMove = (event: PointerEvent) => {
      const card = (event.target as HTMLElement | null)?.closest<HTMLElement>(selector);

      if (!card) return;

      const bounds = card.getBoundingClientRect();

      card.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
      card.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
    };

    root.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => root.removeEventListener("pointermove", onPointerMove);
  }, [selector]);

  return ref;
}
