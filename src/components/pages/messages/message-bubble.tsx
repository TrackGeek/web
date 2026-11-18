import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ReportDialog } from "@/components/shared/report-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MessageContent } from "./message-content";

interface MessageBubbleProps {
  message: ApiTypes.ChatMessage;
  isOwn: boolean;
  isRead?: boolean;
  onDelete: (messageId: string) => void;
}

export function MessageBubble({ message, isOwn, isRead = false, onDelete }: MessageBubbleProps) {
  const { t } = useTranslation();

  const [reporting, setReporting] = useState(false);

  const isDeleted = Boolean(message.deletedAt);
  const isSticker = message.type === "Sticker" && !isDeleted;

  return (
    <div className={cn("group flex items-center gap-1", isOwn ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1 rounded-2xl px-3 py-2",
          isSticker ? "bg-transparent" : isOwn ? "bg-primary/15" : "bg-muted",
          isDeleted && "bg-transparent border border-dashed border-border",
        )}
      >
        <MessageContent message={message} />
        <div className="flex items-center gap-1 self-end text-[10px] text-muted-foreground">
          <time dateTime={message.createdAt}>{format(new Date(message.createdAt), "HH:mm")}</time>
          {isOwn && !isDeleted && (
            <Icon
              icon={isRead ? "lucide:check-check" : "lucide:check"}
              aria-label={isRead ? t("chat:read") : t("chat:sent")}
              role="img"
              className={cn("size-3.5", isRead && "text-sky-500")}
            />
          )}
        </div>
      </div>

      {!isDeleted && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                aria-label={t("chat:messageOptions")}
                className="size-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 transition-opacity text-muted-foreground"
              >
                <Icon icon="lucide:ellipsis" className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? "end" : "start"}>
              {isOwn ? (
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(message.id)}>
                  <Icon icon="lucide:trash-2" className="size-4" />
                  {t("chat:deleteMessage")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => setReporting(true)}>
                  <Icon icon="lucide:flag" className="size-4" />
                  {t("feed:report")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {!isOwn && (
            <ReportDialog open={reporting} onOpenChange={setReporting} targetType="Message" targetId={message.id} />
          )}
        </>
      )}
    </div>
  );
}
