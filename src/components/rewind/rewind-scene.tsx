import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface RewindSceneProps {
  id: string;
  index: number;
  label: string;
  active: boolean;
  children: ReactNode;
}

export function RewindScene({ id, index, label, active, children }: RewindSceneProps) {
  const { i18n } = useTranslation();
  return (
    <section
      dir={i18n.dir()}
      id={`replay-${id}`}
      data-replay-scene={index}
      data-active={active ? "true" : undefined}
      aria-label={label}
      aria-hidden={!active ? true : undefined}
      inert={!active}
      className="h-full w-full min-w-0 shrink-0 snap-start overflow-y-auto [&>div]:min-h-full"
    >
      {children}
    </section>
  );
}
