import { Icon } from "@iconify/react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { QUICK_REACTIONS } from "@/lib/reactions";

interface ActivityReactionsProps {
  activityId?: string;
  reactions?: ApiTypes.ActivityReaction[];
  likes?: number;
  onReact?: (emoji: string, currentReaction?: ApiTypes.ActivityReaction) => void;
  isReacting?: boolean;
  isError?: boolean;
  compact?: boolean;
}

export function ActivityReactions({
  activityId,
  reactions,
  likes = 0,
  onReact,
  isReacting = false,
  isError = false,
  compact = false,
}: ActivityReactionsProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const feedbackId = useId();
  const session = useSession();
  const currentUserId = session.data?.user?.id;

  const reactionList = reactions ?? [];
  const currentReaction = currentUserId ? reactionList.find((r) => r.user.id === currentUserId) : undefined;
  const reactionCounts = reactionList.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});
  const total = Math.max(likes, reactionList.length);
  const popularEmojis = Object.keys(reactionCounts)
    .sort((a, b) => {
      if (a === currentReaction?.emoji) return -1;
      if (b === currentReaction?.emoji) return 1;
      return reactionCounts[b] - reactionCounts[a];
    })
    .slice(0, 3);

  if (!activityId) {
    return (
      <div className="flex gap-1.5 items-center">
        <Icon icon={"lucide:heart"} className="size-4" />
        <p className="text-muted-foreground">{likes}</p>
      </div>
    );
  }

  const reactionButtons = QUICK_REACTIONS.map((emoji) => {
    const count = reactionCounts[emoji] ?? 0;
    const active = currentReaction?.emoji === emoji;

    return (
      <button
        key={emoji}
        type="button"
        onClick={() => {
          onReact?.(emoji, currentReaction);
          setIsOpen(false);
        }}
        disabled={isReacting || !currentUserId || !onReact}
        aria-pressed={active}
        aria-label={t(active ? "feed:removeReaction" : "feed:reactWith", { emoji, count })}
        className={`inline-flex items-center justify-center gap-1 rounded-full border px-2 py-1 text-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:bg-muted disabled:opacity-50 disabled:cursor-not-allowed ${compact ? "min-h-11 min-w-11" : ""} ${
          active
            ? "border-primary bg-primary/10 text-primary"
            : "border-border/50 hover:border-primary/50 hover:bg-muted"
        }`}
      >
        <span aria-hidden="true" className="text-base leading-none">
          {emoji}
        </span>
        {count > 0 && <span className="text-xs tabular-nums text-muted-foreground">{count}</span>}
        {compact && active && <Icon icon="lucide:check" aria-hidden="true" className="size-3 text-primary" />}
      </button>
    );
  });

  if (!compact) {
    return <div className="flex flex-wrap items-center justify-start gap-1 sm:justify-end">{reactionButtons}</div>;
  }

  return (
    <div className="min-w-0 max-w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={isReacting}
            aria-busy={isReacting}
            aria-label={isReacting ? t("feed:saving") : t("feed:chooseReaction", { count: total })}
            aria-describedby={isError ? feedbackId : undefined}
            data-has-reaction={Boolean(currentReaction)}
            className="flex min-h-9 min-w-9 max-w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-border/50 px-2.5 text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring enabled:active:bg-muted disabled:cursor-wait disabled:opacity-50 data-[has-reaction=true]:border-primary data-[has-reaction=true]:bg-primary/10 data-[has-reaction=true]:text-primary"
          >
            {isReacting ? (
              <Icon icon="lucide:loader-circle" aria-hidden="true" className="size-4 motion-safe:animate-spin" />
            ) : popularEmojis.length > 0 ? (
              <span aria-hidden="true" className="flex -space-x-1">
                {popularEmojis.map((emoji) => (
                  <span key={emoji} className="flex size-5 items-center justify-center rounded-full bg-card text-base">
                    {emoji}
                  </span>
                ))}
              </span>
            ) : (
              <Icon icon="lucide:smile-plus" aria-hidden="true" className="size-4" />
            )}
            {total > 0 && (
              <span className="text-xs font-medium tabular-nums">
                {new Intl.NumberFormat(i18n.language, { notation: "compact", maximumFractionDigits: 1 }).format(total)}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          collisionPadding={16}
          aria-label={t("notifications:reaction")}
          className="w-60 max-w-[calc(100vw-2rem)] p-3 motion-reduce:animate-none"
        >
          <div className="grid grid-cols-3 gap-2">{reactionButtons}</div>
          {!currentUserId && <p className="mt-3 text-sm text-muted-foreground">{t("feed:signInToReact")}</p>}
        </PopoverContent>
      </Popover>
      {isError && (
        <p id={feedbackId} role="alert" className="mt-1 flex items-start gap-1 text-xs text-destructive">
          <Icon icon="lucide:circle-alert" aria-hidden="true" className="size-3.5 shrink-0" />
          {t("feed:reactionError")}
        </p>
      )}
    </div>
  );
}
