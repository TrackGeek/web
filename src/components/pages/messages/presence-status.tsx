import { useTranslation } from "react-i18next";
import { PresenceLabel } from "@/components/shared/presence/presence-label";
import { useIsTyping } from "@/hooks/chat";
import { usePresence } from "@/hooks/presence";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PresenceStatusProps {
  conversationId: string;
  user: ApiTypes.ChatUser;
  fallback: ApiTypes.PresenceState;
  className?: string;
}

export function PresenceStatus({ conversationId, user, fallback, className }: PresenceStatusProps) {
  const { t } = useTranslation();

  const isTyping = useIsTyping(conversationId);
  const { data } = usePresence(user.id);

  if (isTyping) {
    return <span className={cn("text-xs italic text-primary", className)}>{t("chat:typing")}</span>;
  }

  return <PresenceLabel presence={data ?? fallback} className={className} />;
}
