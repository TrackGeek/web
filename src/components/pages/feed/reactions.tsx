import { Icon } from "@iconify/react";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { QUICK_REACTIONS } from "@/lib/reactions";

interface ActivityReactionsProps {
  activityId?: string;
  reactions?: ApiTypes.ActivityReaction[];
  likes?: number;
  onReact?: (emoji: string, currentReaction?: ApiTypes.ActivityReaction) => void;
  isReacting?: boolean;
}

export function ActivityReactions({
  activityId,
  reactions,
  likes = 0,
  onReact,
  isReacting = false,
}: ActivityReactionsProps) {
  const session = useSession();
  const currentUserId = session.data?.user?.id;

  const reactionList = reactions ?? [];
  const currentReaction = currentUserId ? reactionList.find((r) => r.user.id === currentUserId) : undefined;
  const reactionCounts = reactionList.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});

  if (!activityId) {
    return (
      <div className="flex gap-1.5 items-center">
        <Icon icon={"lucide:heart"} className="size-4" />
        <p className="text-muted-foreground">{likes}</p>
      </div>
    );
  }

  return (
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
            <span className="text-base leading-none" style={{ fontFamily: "'Noto Color Emoji', sans-serif" }}>
              {emoji}
            </span>
            {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
