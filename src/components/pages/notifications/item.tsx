import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiTypes } from "@/lib/api.ts";
import { AVATAR_BLUR } from "@/lib/image";
import { cn, getInitialsFromName } from "@/lib/utils";

interface NotificationItemProps {
  notification: ApiTypes.Notification;
  isPending: boolean;
  onToggleRead: () => void;
  onDelete: () => void;
}

export function NotificationItem({ notification, isPending, onToggleRead, onDelete }: NotificationItemProps) {
  const { t } = useTranslation();

  const { actor, reaction, comment, metadata } = notification;
  const isRead = notification.readAt !== null;
  const isSystem = notification.type === "System";

  const systemTitle = metadata?.titleKey ? t(metadata.titleKey) : metadata?.title;
  const systemDescription = metadata?.descriptionKey ? t(metadata.descriptionKey) : metadata?.description;

  return (
    <Card className={cn("py-0", !isRead && "border-primary/40 bg-primary/5")}>
      <CardContent className="flex items-center gap-4 p-4">
        {!isRead && <span className="size-2 rounded-full bg-destructive shrink-0" aria-hidden="true" />}

        {isSystem || !actor ? (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-muted">
            <Icon icon="lucide:megaphone" className="size-4.5" />
          </div>
        ) : (
          <Avatar className="size-9 border border-border/50 shrink-0">
            {actor.profile?.avatarUrl ? (
              <Image
                className="aspect-square size-full"
                src={actor.profile.avatarUrl}
                width={36}
                height={36}
                background={AVATAR_BLUR}
                alt={actor.username}
              />
            ) : (
              <AvatarFallback>{getInitialsFromName(actor.name)}</AvatarFallback>
            )}
          </Avatar>
        )}

        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            {isSystem || !actor ? (
              <span className="text-sm font-semibold">{systemTitle ?? t("notifications:system")}</span>
            ) : (
              <>
                <Link
                  to="/user/$username"
                  params={{ username: actor.username }}
                  className="text-sm font-semibold hover:underline"
                >
                  {actor.username}
                </Link>

                <span className="text-sm text-muted-foreground">{t(`notifications:types.${notification.type}`)}</span>

                {reaction && <span aria-hidden="true">{reaction.emoji}</span>}
              </>
            )}

            <time className="text-xs text-muted-foreground" dateTime={notification.createdAt}>
              • {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </time>
          </div>

          {comment && <p className="truncate text-sm text-muted-foreground">“{comment.content}”</p>}

          {isSystem && systemDescription && <p className="text-sm text-muted-foreground">{systemDescription}</p>}

          {isSystem && metadata?.url && (
            <a
              href={metadata.url}
              className="text-sm text-primary hover:underline w-fit"
              target="_blank"
              rel="noreferrer"
            >
              {t("notifications:learnMore")}
            </a>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            onClick={onToggleRead}
            aria-label={isRead ? t("notifications:markAsUnread") : t("notifications:markAsRead")}
            title={isRead ? t("notifications:markAsUnread") : t("notifications:markAsRead")}
          >
            <Icon icon={isRead ? "lucide:mail" : "lucide:mail-open"} className="size-4.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            onClick={onDelete}
            aria-label={t("common:delete")}
            title={t("common:delete")}
          >
            <Icon icon="lucide:trash-2" className="size-4.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
