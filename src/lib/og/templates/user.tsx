import { OG_LOGO_SRC } from "@/lib/og/resources";
import { OG_COLORS, OG_FONT_FAMILY, OG_HEIGHT, OG_WIDTH, truncate } from "@/lib/og/theme";

export interface UserCardStat {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface UserCardProps {
  displayName: string;
  username: string;
  about?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  stats: UserCardStat[];
}

const CARD_WIDTH = 1120;
const CARD_HEIGHT = 550;
const BANNER_HEIGHT = 190;
const AVATAR_SIZE = 148;

export function UserCard({ displayName, username, about, avatarUrl, bannerUrl, stats }: UserCardProps) {
  const name = truncate(displayName || username, 28);
  const bio = truncate(about, 150);

  return (
    <div
      style={{
        display: "flex",
        width: OG_WIDTH,
        height: OG_HEIGHT,
        padding: 40,
        backgroundColor: OG_COLORS.background,
        backgroundImage: `radial-gradient(circle at 20% 0%, rgba(16,185,129,0.18) 0%, rgba(9,9,11,0) 60%)`,
        fontFamily: OG_FONT_FAMILY,
        color: OG_COLORS.foreground,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 32,
          backgroundColor: OG_COLORS.surface,
          border: `1px solid ${OG_COLORS.surfaceElevated}`,
          overflow: "hidden",
        }}
      >
        {bannerUrl ? (
          <img
            src={bannerUrl}
            width={CARD_WIDTH}
            height={BANNER_HEIGHT}
            alt=""
            style={{ objectFit: "cover", width: CARD_WIDTH, height: BANNER_HEIGHT }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              width: CARD_WIDTH,
              height: BANNER_HEIGHT,
              backgroundImage: `linear-gradient(120deg, ${OG_COLORS.primaryDeep} 0%, ${OG_COLORS.primary} 55%, #065f46 100%)`,
            }}
          />
        )}

        <img
          src={OG_LOGO_SRC}
          width={Math.round((32 * 1386) / 443)}
          height={32}
          alt="TrackGeek"
          style={{ position: "absolute", top: 26, right: 32 }}
        />

        <div
          style={{
            position: "absolute",
            top: BANNER_HEIGHT - AVATAR_SIZE / 2,
            left: 44,
            display: "flex",
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: AVATAR_SIZE,
            backgroundColor: OG_COLORS.surface,
            border: `8px solid ${OG_COLORS.surface}`,
            overflow: "hidden",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              width={AVATAR_SIZE - 16}
              height={AVATAR_SIZE - 16}
              alt=""
              style={{ objectFit: "cover", borderRadius: AVATAR_SIZE }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: AVATAR_SIZE - 16,
                height: AVATAR_SIZE - 16,
                borderRadius: AVATAR_SIZE,
                backgroundColor: OG_COLORS.primaryDeep,
                fontSize: 56,
                fontWeight: 800,
              }}
            >
              {(username[0] ?? "?").toUpperCase()}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            padding: "20px 44px 36px 44px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", marginLeft: AVATAR_SIZE + 32, minHeight: 96 }}>
            <span style={{ fontSize: 46, fontWeight: 800, letterSpacing: -1.2, lineClamp: 1 }}>{name}</span>
            <span style={{ fontSize: 26, fontWeight: 500, color: OG_COLORS.muted, marginTop: 4 }}>@{username}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 26 }}>
            <span style={{ fontSize: 19, fontWeight: 700, color: OG_COLORS.mutedStrong, letterSpacing: 2 }}>
              ABOUT ME
            </span>
            <span
              style={{
                fontSize: 26,
                lineHeight: 1.4,
                color: bio ? OG_COLORS.foreground : OG_COLORS.mutedStrong,
                marginTop: 10,
                lineClamp: 2,
                textOverflow: "ellipsis",
              }}
            >
              {bio || "No bio yet."}
            </span>
          </div>

          <div style={{ display: "flex", flexGrow: 1 }} />

          <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
            {stats.map((stat) => (
              <StatChip key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, highlight }: UserCardStat) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        flexBasis: 0,
        padding: "16px 22px",
        borderRadius: 18,
        backgroundColor: highlight ? "rgba(16,185,129,0.12)" : OG_COLORS.surfaceElevated,
        border: `1px solid ${highlight ? OG_COLORS.primaryDeep : OG_COLORS.outline}`,
      }}
    >
      <span style={{ fontSize: 38, fontWeight: 800, color: highlight ? OG_COLORS.primary : OG_COLORS.foreground }}>
        {value}
      </span>
      <span style={{ fontSize: 19, fontWeight: 600, color: OG_COLORS.muted, letterSpacing: 1.1, marginTop: 2 }}>
        {label}
      </span>
    </div>
  );
}
