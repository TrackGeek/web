import { useTranslation } from "react-i18next";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";

interface MessageContentProps {
  message: ApiTypes.ChatMessage;
  className?: string;
}

export function MessageContent({ message, className }: MessageContentProps) {
  const { t } = useTranslation();

  if (message.deletedAt) {
    return (
      <p className={cn("text-sm italic text-muted-foreground", className)}>
        {message.deletedBy === "Admin" ? t("chat:removedByAdmin") : t("chat:deleted")}
      </p>
    );
  }

  if (message.type === "Sticker") {
    return <img src="/logo.svg" alt={t("chat:stickerAlt")} className={cn("h-12 w-auto", className)} />;
  }

  return <p className={cn("whitespace-pre-wrap break-words text-sm", className)}>{message.content}</p>;
}
