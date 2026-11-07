import { OgFrame, OgLogo } from "@/lib/og/templates/shell";
import { OG_COLORS, truncate } from "@/lib/og/theme";

export interface PageCardProps {
  title: string;
  description?: string | null;
  siteLabel?: string;
}

export function PageCard({ title, description, siteLabel = "trackgeek.net" }: PageCardProps) {
  const heading = truncate(title, 110);
  const summary = truncate(description, 170);

  return (
    <OgFrame padding={64}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <OgLogo height={44} />
        <span style={{ fontSize: 22, color: OG_COLORS.muted }}>{siteLabel}</span>
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, gap: 24, minHeight: 0 }}
      >
        <div
          style={{
            display: "flex",
            minWidth: 0,
            overflowWrap: "break-word",
            fontSize: heading.length > 65 ? 60 : heading.length > 35 ? 72 : 88,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: -2.5,
            lineClamp: 3,
            textOverflow: "ellipsis",
          }}
        >
          {heading}
        </div>
        {summary ? (
          <div
            style={{
              display: "flex",
              maxWidth: 940,
              fontSize: 27,
              lineHeight: 1.45,
              color: OG_COLORS.muted,
              lineClamp: 2,
              textOverflow: "ellipsis",
            }}
          >
            {summary}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingTop: 24,
          borderTop: `1px solid ${OG_COLORS.surfaceElevated}`,
          fontSize: 23,
          color: OG_COLORS.primarySoft,
          flexShrink: 0,
        }}
      >
        Track everything you love
      </div>
    </OgFrame>
  );
}
