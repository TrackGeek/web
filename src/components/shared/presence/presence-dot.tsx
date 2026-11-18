import { useTranslation } from "react-i18next";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<ApiTypes.PresenceStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-muted-foreground/50",
};

const STATUS_LABELS: Record<ApiTypes.PresenceStatus, string> = {
  online: "chat:statusOnline",
  away: "chat:statusAway",
  offline: "chat:statusOffline",
};

interface PresenceDotProps {
  presence?: ApiTypes.PresenceState | null;
  className?: string;
}

export function PresenceDot({ presence, className }: PresenceDotProps) {
  const { t } = useTranslation();

  if (!presence || "hidden" in presence) return null;

  return (
    <span
      role="img"
      aria-label={t(STATUS_LABELS[presence.status])}
      className={cn("block size-3 rounded-full ring-2 ring-card", STATUS_CLASSES[presence.status], className)}
    />
  );
}
