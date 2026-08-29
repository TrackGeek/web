import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Trans, useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiTypes } from "@/lib/api";
import type { FeedItemData, FeedProfile } from "./normalize";
import { ActivityReactions } from "./reactions";

interface feedItemProps {
  profile: FeedProfile;
  item: FeedItemData;
  onReact?: (emoji: string, currentReaction?: ApiTypes.ActivityReaction) => void;
  isReacting?: boolean;
}

export function ActivityItem({ profile, item, onReact, isReacting = false }: feedItemProps) {
  const { i18n } = useTranslation();

  const hasMediaLink = Boolean(item.media);
  const mediaLink = item.media ? ({ to: item.media.to, params: { slug: item.media.slug } } as const) : null;

  const highlightClass = "font-bold text-foreground hover:text-primary transition-colors";
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
    <Card className="p-0">
      <CardContent className="flex flex-row p-0 gap-0">
        {hasMediaLink && mediaLink ? (
          <Link {...mediaLink}>
            <div className="w-24 sm:w-30 h-35 shrink-0 rounded-l-xl bg-muted/50 flex items-center justify-center">
              {item.coverURL ? (
                <Image
                  src={item.coverURL}
                  layout="fullWidth"
                  aspectRatio={3 / 4}
                  alt={item.mediaTitle ?? ""}
                  className="w-full h-35 rounded-l-xl object-cover"
                />
              ) : (
                <Icon icon={item.icon ?? "lucide:activity"} className="size-10 text-muted-foreground" />
              )}
            </div>
          </Link>
        ) : (
          <div className="w-24 sm:w-30 h-35 shrink-0 rounded-l-xl bg-muted/50 flex items-center justify-center">
            {item.coverURL ? (
              <Image
                src={item.coverURL}
                layout="fullWidth"
                aspectRatio={3 / 4}
                alt={item.mediaTitle ?? ""}
                className="w-full h-35 rounded-l-xl object-cover"
              />
            ) : (
              <Icon icon={item.icon ?? "lucide:activity"} className="size-10 text-muted-foreground" />
            )}
          </div>
        )}

        <div className="p-4 sm:py-6 sm:px-6 flex flex-1 min-w-0 flex-col sm:flex-row sm:justify-between gap-3 items-start">
          <div className="flex flex-col items-start justify-between gap-3 min-w-0 h-full">
            <span className="text-md font-semibold capitalize">
              <Trans i18nKey={item.titleKey} values={item.titleValues} components={{ strong: highlight }} />
            </span>

            <div className="flex items-center gap-3">
              <Link
                to="/user/$username"
                params={{ username: profile.username ?? "" }}
                className="flex items-center gap-2"
              >
                <Avatar size="sm">
                  {profile.avatarURL ? (
                    <Image
                      src={profile.avatarURL}
                      width={32}
                      height={32}
                      className="size-8 shrink-0 rounded-full object-cover"
                      alt={profile.name}
                    />
                  ) : (
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>

                <p className="text-sm font-bold text-muted-foreground">{profile.name}</p>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end justify-between gap-3 w-full sm:w-auto sm:ml-4 h-full">
            <p className="text-xs text-muted-foreground whitespace-nowrap">{item.time.toLocaleString(i18n.language)}</p>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <ActivityReactions
                activityId={item.activityId}
                reactions={item.reactions}
                likes={item.likes}
                onReact={onReact}
                isReacting={isReacting}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
