import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Markdown } from "@/components/shared/comments/markdown";
import { StarRating } from "@/components/shared/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiTypes } from "@/lib/api";
import { ActivityCover } from "./activity-cover";
import type { FeedProfile, FeedReviewData } from "./normalize";
import { ActivityReactions } from "./reactions";

interface ReviewActivityItemProps {
  profile: FeedProfile;
  item: FeedReviewData;
  onReact?: (emoji: string, currentReaction?: ApiTypes.ActivityReaction) => void;
  isReacting?: boolean;
  isReactionError?: boolean;
}

export function ReviewActivityItem({
  profile,
  item,
  onReact,
  isReacting = false,
  isReactionError = false,
}: ReviewActivityItemProps) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const highlightClass =
    "font-semibold text-card-foreground hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring";
  const highlight =
    item.titleLink && item.titleLink.to !== "/user/$username" ? (
      <Link to={item.titleLink.to} params={item.titleLink.params} className={highlightClass} />
    ) : (
      <strong />
    );

  const hasExtra = Boolean(item.story || item.notes);

  return (
    <Card className="min-w-0 p-0">
      <CardContent className="flex min-h-32 flex-row gap-0 p-0 sm:min-h-35">
        <ActivityCover coverURL={item.coverURL} mediaTitle={item.mediaTitle} icon={item.icon} media={item.media} />

        <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 py-1 sm:px-4">
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

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StarRating value={item.criteries.all} />
            {item.recommended !== undefined && (
              <Icon
                icon={item.recommended ? "lucide:thumbs-up" : "lucide:thumbs-down"}
                className={item.recommended ? "size-4 text-primary" : "size-4 text-destructive"}
              />
            )}
          </div>

          {item.criteries.breakdown.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {item.criteries.breakdown.map((criterion) => (
                <div key={criterion.labelKey} className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t(`feed:criteries.${criterion.labelKey}`)}:
                  </span>
                  <StarRating value={criterion.value} starClassName="size-3" />
                </div>
              ))}
            </div>
          )}

          {item.content && (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-muted-foreground">{t("feed:summary")}</p>
              <Markdown className="text-xs sm:text-sm">{item.content}</Markdown>
            </div>
          )}

          {hasExtra && (
            <>
              {expanded && (
                <div className="flex flex-col gap-3">
                  {item.story && (
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-muted-foreground">{t("feed:story")}</p>
                      <Markdown className="text-xs sm:text-sm">{item.story}</Markdown>
                    </div>
                  )}
                  {item.notes && (
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-muted-foreground">{t("feed:notes")}</p>
                      <Markdown className="text-xs sm:text-sm">{item.notes}</Markdown>
                    </div>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="inline-flex cursor-pointer items-center gap-1 self-start text-xs text-primary transition-colors hover:text-primary/80"
              >
                <Icon icon={expanded ? "lucide:chevron-up" : "lucide:chevron-down"} className="size-3.5" />
                {t(expanded ? "common:showLess" : "common:showMore")}
              </button>
            </>
          )}

          <div className="mt-auto flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 pb-1">
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
