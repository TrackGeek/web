import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiscordPresence, useNow } from "@/hooks/discord";
import { formatDuration } from "@/lib/utils/date";
import { PresenceInfoTooltip } from "./presence-info-tooltip";

interface SpotifyCardProps {
  userId: string;
}

export function SpotifyCard({ userId }: SpotifyCardProps) {
  const { t } = useTranslation();

  const presenceQuery = useDiscordPresence(userId);

  const spotify = presenceQuery.data?.spotify ?? null;

  const startedAt = spotify?.startedAt ? new Date(spotify.startedAt).getTime() : null;
  const endsAt = spotify?.endsAt ? new Date(spotify.endsAt).getTime() : null;

  const hasProgress = startedAt !== null && endsAt !== null && endsAt > startedAt;

  const now = useNow(hasProgress);

  const duration = hasProgress ? endsAt - startedAt : 0;
  const elapsed = now !== null && hasProgress ? Math.min(Math.max(now - startedAt, 0), duration) : 0;
  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="simple-icons:spotify" className="size-5" />

            {t("user:spotify")}
          </div>

          <PresenceInfoTooltip provider="spotify" />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-center">
        {presenceQuery.isPending ? (
          <div className="flex items-center gap-3">
            <Skeleton className="size-16 shrink-0 rounded-lg" />

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          </div>
        ) : spotify ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {spotify.albumArtUrl ? (
                <Image
                  src={spotify.albumArtUrl}
                  width={64}
                  height={64}
                  alt={spotify.album ?? spotify.name}
                  className="size-16 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground">
                  <Icon icon="simple-icons:spotify" className="size-6" />
                </div>
              )}

              <div className="flex min-w-0 flex-1 flex-col">
                {spotify.url ? (
                  <a
                    href={spotify.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm font-medium hover:text-primary hover:underline"
                  >
                    {spotify.name}
                  </a>
                ) : (
                  <p className="truncate text-sm font-medium">{spotify.name}</p>
                )}

                {spotify.artists && <p className="truncate text-xs text-muted-foreground">{spotify.artists}</p>}

                {spotify.album && <p className="truncate text-xs text-muted-foreground">{spotify.album}</p>}
              </div>
            </div>

            {hasProgress && (
              <div className="flex flex-col gap-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
                  <span>{formatDuration(elapsed)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Empty className="p-0 md:p-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon="simple-icons:spotify" />
              </EmptyMedia>

              <EmptyTitle className="text-base">{t("user:noSpotify")}</EmptyTitle>

              <EmptyDescription className="text-xs">{t("user:noSpotifyDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
