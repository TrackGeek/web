import { OgUserStat } from "@/components/og/user-stat";
import { OgFrame, OgLogo } from "@/lib/og/templates/shell";
import { OG_COLORS, OG_WIDTH, truncate } from "@/lib/og/theme";

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

const BANNER_HEIGHT = 250;
const AVATAR_SIZE = 140;

export function UserCard({ displayName, username, about, avatarUrl, bannerUrl, stats }: UserCardProps) {
  const name = truncate(displayName || username, 45);
  const bio = truncate(about, 160);

  return (
    <OgFrame padding={0}>
      {bannerUrl ? (
        <img
          src={bannerUrl}
          width={OG_WIDTH}
          height={BANNER_HEIGHT}
          alt=""
          style={{ objectFit: "cover", flexShrink: 0 }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            width: OG_WIDTH,
            height: BANNER_HEIGHT,
            flexShrink: 0,
            backgroundColor: OG_COLORS.primaryDeep,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: OG_WIDTH,
          height: BANNER_HEIGHT,
          backgroundImage: `linear-gradient(180deg, ${OG_COLORS.shadow}, ${OG_COLORS.transparent} 35%, ${OG_COLORS.background})`,
        }}
      />
      <div style={{ position: "absolute", top: 40, left: 56, display: "flex" }}>
        <OgLogo height={36} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 56px 44px",
          marginTop: -56,
          flex: 1,
          minHeight: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 28, flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: AVATAR_SIZE,
              border: `6px solid ${OG_COLORS.background}`,
              backgroundColor: OG_COLORS.surfaceElevated,
              overflow: "hidden",
              flexShrink: 0,
              fontSize: 56,
              fontWeight: 700,
              color: OG_COLORS.primarySoft,
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                width={AVATAR_SIZE - 12}
                height={AVATAR_SIZE - 12}
                alt=""
                style={{ objectFit: "cover" }}
              />
            ) : (
              (username[0] ?? "?").toUpperCase()
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 6, paddingBottom: 8 }}>
            <span
              style={{
                fontSize: name.length > 28 ? 42 : 52,
                fontWeight: 800,
                letterSpacing: -1.5,
                minWidth: 0,
                overflowWrap: "break-word",
                lineClamp: 1,
                textOverflow: "ellipsis",
              }}
            >
              {name}
            </span>
            <span style={{ fontSize: 25, color: OG_COLORS.muted, lineClamp: 1, textOverflow: "ellipsis" }}>
              @{truncate(username, 50)}
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 25,
            lineHeight: 1.4,
            color: OG_COLORS.muted,
            marginTop: 26,
            lineClamp: 2,
            textOverflow: "ellipsis",
          }}
        >
          {bio || "No bio yet."}
        </div>
        <div style={{ display: "flex", flexGrow: 1, minHeight: 24 }} />
        <div
          style={{
            display: "flex",
            gap: 32,
            paddingTop: 24,
            borderTop: `1px solid ${OG_COLORS.surfaceElevated}`,
            flexShrink: 0,
          }}
        >
          {stats.map((stat) => (
            <OgUserStat key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </OgFrame>
  );
}
