import { OgStarRating } from "@/components/og/star-rating";
import { OgBadge, OgFrame, OgLogo } from "@/lib/og/templates/shell";
import { OG_COLORS, truncate } from "@/lib/og/theme";

export interface MediaCardProps {
  kindLabel: string;
  title: string;
  year?: string | null;
  facts?: string[];
  description?: string | null;
  score?: number | null;
  posterUrl?: string | null;
}

const POSTER_WIDTH = 322;
const POSTER_HEIGHT = 483;

export function MediaCard({ kindLabel, title, year, facts = [], description, score, posterUrl }: MediaCardProps) {
  const heading = truncate(title, 100);
  const summary = truncate(description, 170);
  const metadata = [year, ...facts].filter((value): value is string => Boolean(value));
  const hasScore = typeof score === "number" && Number.isFinite(score) && score > 0;

  return (
    <OgFrame>
      <div style={{ display: "flex", alignItems: "center", gap: 48, height: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: POSTER_WIDTH,
            height: POSTER_HEIGHT,
            flexShrink: 0,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: OG_COLORS.surface,
            border: `1px solid ${OG_COLORS.surfaceElevated}`,
            boxShadow: `0 20px 48px ${OG_COLORS.shadow}`,
          }}
        >
          {posterUrl ? (
            <img src={posterUrl} width={POSTER_WIDTH} height={POSTER_HEIGHT} alt="" style={{ objectFit: "cover" }} />
          ) : (
            <OgLogo height={50} />
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: POSTER_HEIGHT }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <OgBadge label={kindLabel} />
            <OgLogo height={32} />
          </div>

          <div
            style={{
              display: "flex",
              minWidth: 0,
              overflowWrap: "break-word",
              fontSize: heading.length > 56 ? 48 : heading.length > 30 ? 56 : 68,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -2,
              marginTop: 32,
              lineClamp: 3,
              textOverflow: "ellipsis",
              flexShrink: 0,
            }}
          >
            {heading}
          </div>

          {metadata.length > 0 ? (
            <div
              style={{
                display: "flex",
                fontSize: 21,
                lineHeight: 1.4,
                color: OG_COLORS.muted,
                marginTop: 18,
                lineClamp: 2,
                textOverflow: "ellipsis",
                flexShrink: 0,
              }}
            >
              {truncate(metadata.join(" / "), 76)}
            </div>
          ) : null}

          {summary ? (
            <div
              style={{
                display: "flex",
                fontSize: 23,
                lineHeight: 1.45,
                color: OG_COLORS.muted,
                marginTop: 22,
                lineClamp: 2,
                textOverflow: "ellipsis",
              }}
            >
              {summary}
            </div>
          ) : null}

          <div style={{ display: "flex", flexGrow: 1, minHeight: 20 }} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              paddingTop: 20,
              borderTop: `1px solid ${OG_COLORS.surfaceElevated}`,
            }}
          >
            {hasScore ? (
              <OgStarRating score={score} />
            ) : (
              <span style={{ fontSize: 23, color: OG_COLORS.muted }}>Not rated yet. Be the first to review it.</span>
            )}
          </div>
        </div>
      </div>
    </OgFrame>
  );
}
