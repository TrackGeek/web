import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiTypes } from "@/lib/api.ts";
import { AVATAR_BLUR } from "@/lib/image";
import { cn, getInitialsFromName } from "@/lib/utils";
import { normalizeReleaseNotification, type ReleaseNotificationData } from "./normalize-release";

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
  const isSystem =
    notification.type === "System" || notification.type === "LevelUp" || notification.type === "MissionCompleted";
  const release = normalizeReleaseNotification(notification, t);

  const systemParams = {
    ...metadata,
    ...(typeof metadata?.missionKey === "string" && { missionName: t(`missions:${metadata.missionKey}.name`) }),
  };

  const systemTitle = metadata?.titleKey ? t(metadata.titleKey, systemParams) : metadata?.title;
  const systemDescription = metadata?.descriptionKey ? t(metadata.descriptionKey, systemParams) : metadata?.description;

  const timestamp = (
    <time className="text-xs text-muted-foreground" dateTime={notification.createdAt}>
      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
    </time>
  );

  return (
    <Card className={cn("py-0 overflow-hidden", !isRead && "border-primary/40 bg-primary/5")}>
      <CardContent className="flex items-center gap-4 p-4">
        {!isRead && <span className="size-2 rounded-full bg-destructive shrink-0" aria-hidden="true" />}

        {release ? (
          <ReleaseCover release={release} />
        ) : isSystem || !actor ? (
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
          {release ? (
            <>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold">{release.headline}</span>

                {release.reopened && (
                  <Badge variant="secondary" className="gap-1">
                    <Icon icon="lucide:rotate-ccw" className="size-3" />
                    {t("notifications:release.reopened")}
                  </Badge>
                )}
              </div>

              {release.unitTitle && <p className="truncate text-sm text-muted-foreground">{release.unitTitle}</p>}

              <div className="flex flex-wrap items-center gap-x-2">
                {release.media && (
                  <Link
                    to={release.media.to}
                    params={{ slug: release.media.slug }}
                    className="text-sm text-primary hover:underline w-fit"
                  >
                    {t("notifications:release.viewTitle")}
                  </Link>
                )}

                {timestamp}
              </div>
            </>
          ) : (
            <>
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

                    <span className="text-sm text-muted-foreground">
                      {t(`notifications:types.${notification.type}`)}
                    </span>

                    {reaction && <span aria-hidden="true">{reaction.emoji}</span>}
                  </>
                )}

                <span className="text-xs text-muted-foreground">•</span>
                {timestamp}
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
            </>
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

function ReleaseCover({ release }: { release: ReleaseNotificationData }) {
  const cover = (
    <div className="w-12 sm:w-14 shrink-0 overflow-hidden rounded-md border border-border/50 bg-muted/50">
      {release.coverURL ? (
        <Image
          src={release.coverURL}
          layout="fullWidth"
          aspectRatio={3 / 4}
          alt={release.mediaTitle}
          className="w-full object-cover"
        />
      ) : (
        <div className="flex aspect-3/4 items-center justify-center">
          <Icon icon={release.icon} className="size-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );

  if (!release.media) {
    return cover;
  }

  return (
    <Link
      to={release.media.to}
      params={{ slug: release.media.slug }}
      className="shrink-0"
      aria-label={release.mediaTitle}
    >
      {cover}
    </Link>
  );
}
