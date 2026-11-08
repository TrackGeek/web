import { Animation, Root } from "@bsmnt/scrollytelling";
import { type ComponentProps, type ReactNode, type RefObject, useMemo } from "react";

interface RewindStageProps {
  rootRef: RefObject<HTMLDivElement | null>;
  animated: boolean;
  sceneCount: number;
  onProgress: (progress: number) => void;
  children: ReactNode;
}

export function RewindStage({ rootRef, animated, sceneCount, onProgress, children }: RewindStageProps) {
  const callbacks = useMemo<NonNullable<ComponentProps<typeof Root>["callbacks"]>>(
    () => ({
      onUpdate: (trigger) => onProgress(trigger.progress),
      onRefresh: (trigger) => onProgress(trigger.progress),
    }),
    [onProgress],
  );
  const tween = useMemo(
    () => ({
      start: 0,
      end: 100,
      fromTo: [{ xPercent: 0 }, { xPercent: -(sceneCount - 1) * 100, ease: "none" }] as [
        gsap.TweenVars,
        gsap.TweenVars,
      ],
    }),
    [sceneCount],
  );

  return (
    <Root disabled={!animated} callbacks={callbacks}>
      <div ref={rootRef} style={animated ? { height: `${sceneCount * 100}svh` } : undefined}>
        <div
          className={
            animated
              ? "sticky top-0 h-svh overflow-clip pt-27 pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
              : "pt-27 pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
          }
        >
          <Animation disabled={!animated} tween={tween}>
            <div dir="ltr" className={animated ? "flex h-full w-full will-change-transform" : "block"}>
              {children}
            </div>
          </Animation>
        </div>
      </div>
    </Root>
  );
}
