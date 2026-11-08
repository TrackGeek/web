import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface RewindSceneProps {
  id: string;
  index: number;
  label: string;
  animated: boolean;
  active: boolean;
  children: ReactNode;
}

export function RewindScene({ id, index, label, animated, active, children }: RewindSceneProps) {
  const { i18n } = useTranslation();
  return (
    <section
      dir={i18n.dir()}
      id={`replay-${id}`}
      data-replay-scene={index}
      aria-label={label}
      aria-hidden={animated && !active ? true : undefined}
      inert={animated && !active}
      className={
        animated
          ? "h-full w-full min-w-0 shrink-0 overflow-y-auto [&>div]:min-h-full"
          : "min-h-[calc(100svh-11.25rem)] scroll-mt-27 [&>div]:min-h-[calc(100svh-11.25rem)]"
      }
    >
      {children}
    </section>
  );
}
