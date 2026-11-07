import type { ReactNode } from "react";
import { OG_LOGO_SRC } from "@/lib/og/resources";
import { OG_COLORS, OG_FONT_FAMILY, OG_HEIGHT, OG_WIDTH } from "@/lib/og/theme";

interface OgFrameProps {
  children: ReactNode;
  padding?: number;
}

export function OgFrame({ children, padding = 54 }: OgFrameProps) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: OG_WIDTH,
        height: OG_HEIGHT,
        backgroundColor: OG_COLORS.background,
        backgroundImage: `radial-gradient(ellipse at 100% 0%, ${OG_COLORS.ambient}, ${OG_COLORS.transparent} 65%)`,
        fontFamily: OG_FONT_FAMILY,
        color: OG_COLORS.foreground,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: OG_WIDTH,
          height: OG_HEIGHT,
          padding,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function OgLogo({ height = 40 }: { height?: number }) {
  return <img src={OG_LOGO_SRC} width={Math.round((height * 1386) / 443)} height={height} alt="TrackGeek" />;
}

export function OgBadge({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        borderRadius: 10,
        backgroundColor: OG_COLORS.primaryTint,
        border: `1px solid ${OG_COLORS.primaryDeep}`,
        color: OG_COLORS.primarySoft,
        fontSize: 20,
        fontWeight: 500,
      }}
    >
      {label}
    </div>
  );
}
