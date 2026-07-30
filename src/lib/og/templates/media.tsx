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
const SCORE_SEGMENTS = 5;

export function MediaCard({ kindLabel, title, year, facts = [], description, score, posterUrl }: MediaCardProps) {
  const heading = truncate(title, 64);
  const summary = truncate(description, 190);
  const subtitle = [year, ...facts].filter(Boolean).join("  ·  ");
  const hasScore = typeof score === "number" && score > 0;

  return (
    <OgFrame>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 52, height: "100%" }}>
        {posterUrl ? (
          <img
            src={posterUrl}
            width={POSTER_WIDTH}
            height={POSTER_HEIGHT}
            alt=""
            style={{
              borderRadius: 24,
              objectFit: "cover",
              border: `2px solid ${OG_COLORS.surfaceElevated}`,
              boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              width: POSTER_WIDTH,
              height: POSTER_HEIGHT,
              borderRadius: 24,
              backgroundColor: OG_COLORS.surface,
              border: `2px solid ${OG_COLORS.surfaceElevated}`,
            }}
          />
        )}

        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, height: POSTER_HEIGHT }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <OgBadge label={kindLabel} />
            <OgLogo height={34} />
          </div>

          <div
            style={{
              display: "flex",
              fontSize: heading.length > 34 ? 52 : 64,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              marginTop: 28,
              lineClamp: 2,
              textOverflow: "ellipsis",
            }}
          >
            {heading}
          </div>

          {subtitle ? (
            <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: OG_COLORS.muted, marginTop: 16 }}>
              {truncate(subtitle, 62)}
            </div>
          ) : null}

          {summary ? (
            <div
              style={{
                display: "flex",
                fontSize: 25,
                lineHeight: 1.45,
                color: OG_COLORS.muted,
                marginTop: 22,
                lineClamp: 3,
                textOverflow: "ellipsis",
              }}
            >
              {summary}
            </div>
          ) : null}

          <div style={{ display: "flex", flexGrow: 1 }} />

          {hasScore ? <ScoreBlock score={score} /> : <NoScoreBlock />}
        </div>
      </div>
    </OgFrame>
  );
}

function ScoreBlock({ score }: { score: number }) {
  const filled = Math.max(0, Math.min(1, score / SCORE_SEGMENTS));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 24,
        padding: "20px 28px",
        borderRadius: 20,
        backgroundColor: OG_COLORS.surface,
        border: `1px solid ${OG_COLORS.surfaceElevated}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "row", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 56, fontWeight: 800, color: OG_COLORS.primary, letterSpacing: -2 }}>
          {score.toFixed(1)}
        </span>
        <span style={{ fontSize: 26, fontWeight: 600, color: OG_COLORS.mutedStrong }}>/5</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flexGrow: 1 }}>
        <span style={{ fontSize: 20, fontWeight: 600, color: OG_COLORS.muted, letterSpacing: 1.2 }}>
          TRACKGEEK SCORE
        </span>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: 10,
            borderRadius: 999,
            backgroundColor: OG_COLORS.surfaceElevated,
          }}
        >
          <div
            style={{
              display: "flex",
              width: `${filled * 100}%`,
              height: 10,
              borderRadius: 999,
              backgroundImage: `linear-gradient(90deg, ${OG_COLORS.primaryDeep} 0%, ${OG_COLORS.primarySoft} 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function NoScoreBlock() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "22px 28px",
        borderRadius: 20,
        backgroundColor: OG_COLORS.surface,
        border: `1px solid ${OG_COLORS.surfaceElevated}`,
        fontSize: 24,
        fontWeight: 500,
        color: OG_COLORS.muted,
      }}
    >
      Not rated yet — be the first to review it
    </div>
  );
}
