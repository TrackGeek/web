import type { ReactNode } from "react";
import { OG_LOGO_SRC } from "@/lib/og/resources";
import { OG_COLORS, OG_FONT_FAMILY, OG_HEIGHT, OG_WIDTH } from "@/lib/og/theme";

interface OgFrameProps {
  children: ReactNode;
  padding?: number;
}

export function OgFrame({ children, padding = 64 }: OgFrameProps) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: OG_WIDTH,
        height: OG_HEIGHT,
        backgroundColor: OG_COLORS.background,
        fontFamily: OG_FONT_FAMILY,
        color: OG_COLORS.foreground,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -300,
          left: -200,
          width: 820,
          height: 820,
          borderRadius: 820,
          backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.20) 0%, rgba(16,185,129,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -340,
          right: -240,
          width: 780,
          height: 780,
          borderRadius: 780,
          backgroundImage: "radial-gradient(circle, rgba(4,120,87,0.26) 0%, rgba(4,120,87,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: OG_WIDTH,
          height: 6,
          backgroundImage: `linear-gradient(90deg, ${OG_COLORS.primaryDeep} 0%, ${OG_COLORS.primarySoft} 50%, ${OG_COLORS.primaryDeep} 100%)`,
        }}
      />

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
        padding: "8px 18px",
        borderRadius: 999,
        backgroundColor: "rgba(16,185,129,0.14)",
        border: `1px solid ${OG_COLORS.primaryDeep}`,
        color: OG_COLORS.primarySoft,
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: 1.6,
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  );
}
