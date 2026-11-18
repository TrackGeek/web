import { format, isToday, isYesterday } from "date-fns";
import { useTranslation } from "react-i18next";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PresenceLabelProps {
  presence?: ApiTypes.PresenceState | null;
  className?: string;
}

export function PresenceLabel({ presence, className }: PresenceLabelProps) {
  const { t } = useTranslation();

  if (!presence || "hidden" in presence) return null;

  if (presence.status === "online") {
    return <span className={cn("text-xs text-emerald-500", className)}>{t("chat:online")}</span>;
  }

  if (presence.status === "away") {
    return <span className={cn("text-xs text-amber-500", className)}>{t("chat:away")}</span>;
  }

  if (!presence.lastSeenAt) return null;

  const lastSeen = new Date(presence.lastSeenAt);
  const time = format(lastSeen, "HH:mm");

  const label = isToday(lastSeen)
    ? t("chat:lastSeen.today", { time })
    : isYesterday(lastSeen)
      ? t("chat:lastSeen.yesterday", { time })
      : t("chat:lastSeen.date", { date: format(lastSeen, "MMM d"), time });

  return <span className={cn("text-xs text-muted-foreground", className)}>{label}</span>;
}
