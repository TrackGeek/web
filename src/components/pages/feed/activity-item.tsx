import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Trans, useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiTypes } from "@/lib/api";
import { ActivityCover } from "./activity-cover";
import type { FeedItemData, FeedProfile } from "./normalize";
import { ActivityReactions } from "./reactions";

interface ActivityItemProps {
  profile: FeedProfile;
  item: FeedItemData;
  onReact?: (emoji: string, currentReaction?: ApiTypes.ActivityReaction) => void;
  isReacting?: boolean;
  isReactionError?: boolean;
}

export function ActivityItem({
  profile,
  item,
  onReact,
  isReacting = false,
  isReactionError = false,
}: ActivityItemProps) {
  const { i18n } = useTranslation();

  const highlightClass =
    "font-semibold text-card-foreground hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring";
  const highlight = item.titleLink ? (
    item.titleLink.to === "/user/$username" ? (
      <Link
        to="/user/$username"
        params={item.titleLink.params}
        search={item.titleLink.search}
        className={highlightClass}
      />
    ) : (
      <Link to={item.titleLink.to} params={item.titleLink.params} className={highlightClass} />
    )
  ) : (
    <strong />
  );

  return (
    <Card className="min-w-0 p-0">
      <CardContent className="flex min-h-32 flex-row gap-0 p-0 sm:min-h-35">
        <ActivityCover coverURL={item.coverURL} mediaTitle={item.mediaTitle} icon={item.icon} media={item.media} />

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 px-3 py-1 sm:px-4">
          <Link
            to="/user/$username"
            params={{ username: profile.username ?? "" }}
            className="flex min-h-11 min-w-0 max-w-full items-center gap-2 self-start rounded-md hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Avatar size="sm" className="shrink-0">
              {profile.avatarURL ? (
                <Image
                  src={profile.avatarURL}
                  width={24}
                  height={24}
                  className="size-6 shrink-0 rounded-full object-cover"
                  alt=""
                />
              ) : (
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <span className="min-w-0 truncate text-sm font-semibold">{profile.name}</span>
          </Link>

          <p className="min-w-0 text-base leading-snug text-muted-foreground wrap-anywhere first-letter:uppercase">
            <Trans i18nKey={item.titleKey} values={item.titleValues} components={{ strong: highlight }} />
          </p>

          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <time
              dateTime={item.time.toISOString()}
              title={item.time.toLocaleString(i18n.language)}
              className="text-xs text-muted-foreground"
            >
              {item.time.toLocaleString(i18n.language, { dateStyle: "short", timeStyle: "short" })}
            </time>
            <ActivityReactions
              activityId={item.activityId}
              reactions={item.reactions}
              likes={item.likes}
              onReact={onReact}
              isReacting={isReacting}
              isError={isReactionError}
              compact
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
