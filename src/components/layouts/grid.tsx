import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GridProps {
  children: ReactNode;

  minColSize?: string;

  gap?: string;

  className?: string;

  preset?: "auto" | "8col" | "4col" | "2col" | "1col";
}

const PRESET_CONFIGS: Record<Exclude<GridProps["preset"], undefined>, { minColSize: string }> = {
  auto: { minColSize: "16rem" },
  "8col": { minColSize: "calc(100% / 8)" },
  "4col": { minColSize: "calc(100% / 4)" },
  "2col": { minColSize: "calc(100% / 2)" },
  "1col": { minColSize: "100%" },
};

export function Grid({ children, minColSize, gap = "gap-4", className, preset = "auto" }: GridProps) {
  const config = PRESET_CONFIGS[preset];
  const finalMinColSize = minColSize || config.minColSize;

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(${finalMinColSize}, 1fr))`,
    gap: preset === "auto" ? undefined : "1rem",
  } as CSSProperties;

  const containerClass = cn(preset === "auto" ? gap : "", className);

  return (
    <div className={containerClass} style={gridStyle}>
      {children}
    </div>
  );
}
