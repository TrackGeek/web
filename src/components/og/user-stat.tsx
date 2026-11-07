import type { UserCardStat } from "@/lib/og/templates/user";
import { OG_COLORS, truncate } from "@/lib/og/theme";

export function OgUserStat({ label, value, highlight }: UserCardStat) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, flexBasis: 0, minWidth: 0, gap: 8 }}>
      <span
        style={{
          fontSize: 42,
          fontWeight: 700,
          letterSpacing: -1.5,
          color: highlight ? OG_COLORS.primarySoft : OG_COLORS.foreground,
          lineClamp: 1,
        }}
      >
        {truncate(value, 12)}
      </span>
      <span style={{ fontSize: 21, color: OG_COLORS.muted, lineClamp: 1 }}>{label}</span>
    </div>
  );
}
