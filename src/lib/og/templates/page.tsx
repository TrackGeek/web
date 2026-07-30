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
    <OgFrame padding={80}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <OgLogo height={46} />

        <div style={{ display: "flex", flexGrow: 1 }} />

        <div style={{ display: "flex", width: 96, height: 6, borderRadius: 999, backgroundColor: OG_COLORS.primary }} />

        <div
          style={{
            display: "flex",
            fontSize: heading.length > 60 ? 58 : 72,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -2,
            marginTop: 28,
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
              fontSize: 28,
              lineHeight: 1.45,
              color: OG_COLORS.muted,
              marginTop: 24,
              lineClamp: 2,
              textOverflow: "ellipsis",
            }}
          >
            {summary}
          </div>
        ) : null}

        <div style={{ display: "flex", flexGrow: 1 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 28,
            borderTop: `1px solid ${OG_COLORS.surfaceElevated}`,
            fontSize: 24,
            fontWeight: 600,
            color: OG_COLORS.mutedStrong,
          }}
        >
          <span>{siteLabel}</span>
          <span style={{ color: OG_COLORS.primary }}>Track everything you love</span>
        </div>
      </div>
    </OgFrame>
  );
}
