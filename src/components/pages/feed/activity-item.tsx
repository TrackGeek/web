import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Trans, useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { QUICK_REACTIONS } from "@/lib/reactions";
import type { FeedItemData, FeedProfile } from "./normalize";

interface feedItemProps {
  profile: FeedProfile;
  item: FeedItemData;
  onReact?: (emoji: string, currentReaction?: ApiTypes.ActivityReaction) => void;
  isReacting?: boolean;
}

export function ActivityItem({ profile, item, onReact, isReacting = false }: feedItemProps) {
  const { i18n } = useTranslation();
  const session = useSession();
  const currentUserId = session.data?.user?.id;

  const reactionList = item.reactions ?? [];
  const currentReaction = currentUserId ? reactionList.find((r) => r.user.id === currentUserId) : undefined;
  const reactionCounts = reactionList.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});

  const hasMediaLink = Boolean(item.media);
  const mediaLink = item.media ? ({ to: item.media.to, params: { slug: item.media.slug } } as const) : null;

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
                  alt={item.title}
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
                alt={item.title}
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
              <Trans>{item.title}</Trans>
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
              {item.activityId ? (
                <div className="flex flex-wrap items-center justify-start sm:justify-end gap-1">
                  {QUICK_REACTIONS.map((emoji) => {
                    const count = reactionCounts[emoji] ?? 0;
                    const active = currentReaction?.emoji === emoji;

                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => onReact?.(emoji, currentReaction)}
                        disabled={isReacting || !currentUserId}
                        aria-pressed={active}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        <span
                          className="text-base leading-none"
                          style={{ fontFamily: "'Noto Color Emoji', sans-serif" }}
                        >
                          {emoji}
                        </span>
                        {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex gap-1.5 items-center">
                  <Icon icon={"lucide:heart"} className="size-4" />
                  <p className="text-muted-foreground">{item.likes ?? 0}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
