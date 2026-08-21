import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiscordPresence, useNow } from "@/hooks/discord";
import type { ApiTypes } from "@/lib/api";
import { formatDuration } from "@/lib/utils/date";
import { PresenceInfoTooltip } from "./presence-info-tooltip";

const STATUS_COLOR: Record<ApiTypes.DiscordPresenceStatus, string> = {
  online: "bg-emerald-500",
  idle: "bg-amber-500",
  dnd: "bg-red-500",
  offline: "bg-muted-foreground",
};

const STATUS_LABEL: Record<ApiTypes.DiscordPresenceStatus, string> = {
  online: "user:discordStatusOnline",
  idle: "user:discordStatusIdle",
  dnd: "user:discordStatusDnd",
  offline: "user:discordStatusOffline",
};

interface DiscordActivityCardProps {
  userId: string;
}

export function DiscordActivityCard({ userId }: DiscordActivityCardProps) {
  const { t } = useTranslation();

  const presenceQuery = useDiscordPresence(userId);

  const presence = presenceQuery.data;
  const activities = presence?.activities ?? [];

  const now = useNow(activities.some((activity) => !!activity.startedAt));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="simple-icons:discord" className="size-5" />

            {t("user:discordActivity")}
          </div>

          <PresenceInfoTooltip />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {presenceQuery.isPending ? (
          <div className="flex items-center gap-3">
            <Skeleton className="size-14 shrink-0 rounded-lg" />

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ) : (
          <>
            {presence?.status && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`size-2.5 shrink-0 rounded-full ${STATUS_COLOR[presence.status]}`} />

                  <span className="text-sm font-medium">{t(STATUS_LABEL[presence.status])}</span>
                </div>

                {presence.customStatus && (
                  <p className="truncate text-xs text-muted-foreground">{presence.customStatus}</p>
                )}
              </div>
            )}

            {activities.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {activities.map((activity) => (
                  <li key={`${activity.applicationId ?? activity.name}-${activity.type}`} className="flex gap-3">
                    <div className="relative shrink-0">
                      {activity.largeImageUrl ? (
                        <Image
                          src={activity.largeImageUrl}
                          width={56}
                          height={56}
                          alt={activity.largeText ?? activity.name}
                          className="size-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex size-14 items-center justify-center rounded-lg border border-border text-muted-foreground">
                          <Icon icon="lucide:gamepad-2" className="size-6" />
                        </div>
                      )}

                      {activity.smallImageUrl && (
                        <Image
                          src={activity.smallImageUrl}
                          width={20}
                          height={20}
                          alt={activity.smallText ?? ""}
                          className="absolute -right-1 -bottom-1 size-5 rounded-full border-2 border-card object-cover"
                        />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <p className="truncate text-sm font-medium">{activity.name}</p>

                      {activity.details && <p className="truncate text-xs text-muted-foreground">{activity.details}</p>}

                      {activity.state && <p className="truncate text-xs text-muted-foreground">{activity.state}</p>}

                      {activity.startedAt && now !== null && (
                        <p className="text-[11px] tabular-nums text-muted-foreground">
                          {t("user:discordActivityElapsed", {
                            value: formatDuration(now - new Date(activity.startedAt).getTime()),
                          })}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty className="p-0 md:p-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Icon icon="simple-icons:discord" />
                  </EmptyMedia>

                  <EmptyTitle className="text-base">{t("user:noDiscordActivity")}</EmptyTitle>

                  <EmptyDescription className="text-xs">{t("user:noDiscordActivityDescription")}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
