import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Markdown } from "@/components/shared/comments/markdown";
import { StarRating } from "@/components/shared/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth";

const QUICK_REACTIONS = ["👍", "❤️", "🔥", "😂", "😮", "😢"];

interface ReviewItemProps {
  user?: ApiTypes.User;
  reviewText: string;
  likes?: number;
  date: Date;
  criteries: {
    gameplay?: number;
    soundtrack?: number;
    story?: number;
    graphics?: number;
    direction?: number;
    production?: number;
    acting?: number;
    characters?: number;
    language?: number;
    theme?: number;
    art?: number;
    worldbuilding?: number;
    animation?: number;
    all?: number;
  };
  reviewName?: string;
  entityId?: string;
  routeName?: string;
  notes?: string | null;
  story?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  /** When provided, renders the emoji reaction bar for this review. */
  reviewId?: string;
  reactions?: ApiTypes.ReviewReaction[];
  onReact?: (emoji: string, currentReaction?: ApiTypes.ReviewReaction) => void;
  isReacting?: boolean;
}

function buildCriteriaList(criteries?: ReviewItemProps["criteries"]): { label: string; rating: number }[] {
  if (!criteries || typeof criteries !== "object") return [];

  const preferred: Array<keyof ReviewItemProps["criteries"]> = ["language", "story", "theme", "characters"];

  const result: { label: string; rating: number }[] = [];
  const added = new Set<string>();

  for (const key of preferred) {
    const val = (criteries as any)[key];
    if (val !== undefined) {
      result.push({ label: `feed:criteries.${key}`, rating: val as number });
      added.add(String(key));
    }
  }

  for (const [k, v] of Object.entries(criteries)) {
    if (k === "all" || added.has(k)) continue;
    if (v !== undefined) {
      result.push({ label: `feed:criteries.${k}`, rating: v as number });
    }
  }

  return result;
}

export function ReviewItem({
  user,
  reviewText,
  likes = 0,
  date,
  criteries,
  reviewName,
  notes,
  story,
  onEdit,
  onDelete,
  isDeleting = false,
  reviewId,
  reactions,
  routeName,
  entityId,
  onReact,
  isReacting = false,
}: ReviewItemProps) {
  const { t, i18n } = useTranslation();
  const session = useSession();
  const currentUserId = session.data?.user?.id;

  const reactionList = reactions ?? [];
  const currentReaction = currentUserId ? reactionList.find((r) => r.user.id === currentUserId) : undefined;
  const reactionCounts = reactionList.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});

  const [expanded, setExpanded] = useState(false);

  const criteriaList = buildCriteriaList(criteries);

  return (
    <div className="bg-linear-to-br from-muted/50 flex flex-col gap-4 to-muted p-4 rounded-xl border border-border text-left w-full transition-colors">
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-2 gap-2">
            {!reviewName && user ? (
              <Link
                to="/user/$username"
                params={{ username: user?.username }}
                className="inline-flex items-center gap-2 min-w-0 w-auto shrink-0"
              >
                <Avatar size="sm">
                  {user.profile?.avatarUrl ? (
                    <Image
                      className="aspect-square size-full"
                      src={user.profile.avatarUrl}
                      width={24}
                      height={24}
                      alt={user.name}
                    />
                  ) : (
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <p className="text-sm font-bold text-muted-foreground">{user.name}</p>
              </Link>
            ) : (
              <Link
                to={`/${routeName}/${entityId}` as any}
                className="min-w-0 w-auto shrink-0"
              >
                <p className="font-bold truncate text-sm sm:text-base max-w-48">{reviewName}</p>
              </Link>
            )}

            <div className="sm:ml-auto sm:flex hidden items-center gap-1">
              <StarRating value={criteries?.all || 0} />
            </div>
          </div>

          <div className="sm:hidden flex items-center gap-1">
            <StarRating value={criteries?.all || 0} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-3 text-xs">
          {criteriaList.length > 0 &&
            criteriaList.map((criterion) => (
              <div key={criterion.label} className="flex items-center gap-1 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground">{t(criterion.label)}:</span>

                <StarRating value={criterion.rating} starClassName="size-3" />
              </div>
            ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-md font-semibold text-muted-foreground">{t("feed:summary")}</p>
          <Markdown className="text-xs sm:text-sm">{reviewText}</Markdown>
        </div>

        {(story || notes) && (
          <>
            {expanded && (
              <div className="flex flex-col gap-3">
                {story && (
                  <div className="flex flex-col gap-2">
                    <p className="text-md font-semibold text-muted-foreground">{t("feed:story")}</p>
                    <Markdown className="text-xs sm:text-sm">{story}</Markdown>
                  </div>
                )}
                {notes && (
                  <div className="flex flex-col gap-2">
                    <p className="text-md font-semibold text-muted-foreground">{t("feed:notes")}</p>
                    <Markdown className="text-xs sm:text-sm">{notes}</Markdown>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="inline-flex items-center gap-1 self-center text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              <Icon icon={expanded ? "lucide:chevron-up" : "lucide:chevron-down"} className="size-3.5" />

              {t(expanded ? "feed:showLess" : "feed:showMore")}
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 sm:pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {date.toLocaleDateString(i18n.language, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>

        <div className="flex items-center gap-3">
          {reviewId ? (
            <div className="flex flex-wrap items-center gap-1">
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
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 hover:border-primary/50 hover:bg-muted"
                    }`}
                  >
                    <span className="leading-none">{emoji}</span>
                    {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex gap-1.5 items-center cursor-pointer hover:text-red-500 transition-colors">
              <Icon icon={"lucide:heart"} className="size-4" />
              <p className="text-muted-foreground min-w-6 text-center text-sm">{likes}</p>
            </div>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              aria-label={t("feed:edit")}
            >
              <Icon icon={"lucide:pencil"} className="size-4" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="flex items-center text-muted-foreground hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
              aria-label={t("feed:delete")}
            >
              <Icon
                icon={isDeleting ? "lucide:loader-2" : "lucide:trash-2"}
                className={`size-4 ${isDeleting ? "animate-spin" : ""}`}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
