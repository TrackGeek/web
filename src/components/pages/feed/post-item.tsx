import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Markdown } from "@/components/shared/comments/markdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useDeletePost, useUpdatePost } from "@/hooks/post";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { POST_MAX_LENGTH } from "./composer";
import type { FeedPostData, FeedProfile } from "./normalize";
import { ActivityReactions } from "./reactions";

const COLLAPSE_LENGTH = 900;

interface PostItemProps {
  profile: FeedProfile;
  item: FeedPostData;
  onReact?: (emoji: string, currentReaction?: ApiTypes.ActivityReaction) => void;
  isReacting?: boolean;
}

export function PostItem({ profile, item, onReact, isReacting = false }: PostItemProps) {
  const { t, i18n } = useTranslation();
  const session = useSession();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  const deletePost = useDeletePost(session.data?.user?.id);
  const updatePost = useUpdatePost(session.data?.user?.id);

  const isAuthor = session.data?.user?.id === item.authorId;
  const isLong = item.content.length > COLLAPSE_LENGTH;
  const visibleContent = isLong && !isExpanded ? `${item.content.slice(0, COLLAPSE_LENGTH)}…` : item.content;

  function handleDelete() {
    deletePost.mutate(item.postId, {
      onSuccess: () => {
        setIsConfirmingDelete(false);
        toast.success(t("feed:postDeleteSuccess"));
      },
      onError: () => toast.error(t("feed:postDeleteError")),
    });
  }

  function handleUpdate() {
    const content = draft?.trim();
    if (!content) return;

    updatePost.mutate(
      { postId: item.postId, content },
      {
        onSuccess: () => {
          setDraft(null);
          toast.success(t("feed:postUpdateSuccess"));
        },
        onError: () => toast.error(t("feed:postUpdateError")),
      },
    );
  }

  return (
    <Card className="p-0">
      <CardContent className="flex flex-col gap-3 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <Link
            to="/user/$username"
            params={{ username: profile.username ?? "" }}
            className="flex min-w-0 items-center gap-2"
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

            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold">{profile.name}</span>
              <span className="text-xs text-muted-foreground">{item.time.toLocaleString(i18n.language)}</span>
            </div>
          </Link>

          {isAuthor && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDraft(item.content)}
                disabled={draft !== null || updatePost.isPending}
                aria-label={t("feed:edit")}
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <Icon icon="lucide:pencil" className="size-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsConfirmingDelete(true)}
                disabled={deletePost.isPending}
                aria-label={t("common:delete")}
                className="size-8 text-muted-foreground hover:text-destructive"
              >
                <Icon icon="lucide:trash-2" className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {draft !== null ? (
          <div className="flex flex-col gap-2">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={POST_MAX_LENGTH}
              disabled={updatePost.isPending}
              className="max-h-[60vh] min-h-32 resize-none overflow-y-auto"
            />

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDraft(null)}>
                {t("common:cancel")}
              </Button>

              <Button type="button" size="sm" onClick={handleUpdate} disabled={!draft.trim() || updatePost.isPending}>
                {t("common:save")}
              </Button>
            </div>
          </div>
        ) : item.isSpoiler && !isRevealed ? (
          <button
            type="button"
            onClick={() => setIsRevealed(true)}
            aria-label={t("comments:spoilerReveal")}
            className="relative w-full overflow-hidden rounded-md border border-dashed border-border bg-muted/40 py-6 text-left"
          >
            <div className="pointer-events-none max-h-40 select-none overflow-hidden px-3 blur-sm">
              <Markdown>{visibleContent}</Markdown>
            </div>
            <span className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Icon icon="lucide:eye-off" className="size-3.5" />
              {t("comments:spoilerReveal")}
            </span>
          </button>
        ) : (
          <div className="flex flex-col gap-1">
            <Markdown>{visibleContent}</Markdown>

            {isLong && (
              <button
                type="button"
                onClick={() => setIsExpanded((value) => !value)}
                className="w-fit text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                {isExpanded ? t("common:showLess") : t("common:showMore")}
              </button>
            )}
          </div>
        )}

        {item.media && (
          <Link
            to={item.media.to}
            params={{ slug: item.media.slug }}
            className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2 transition-colors hover:bg-muted/60"
          >
            {item.coverURL ? (
              <Image
                src={item.coverURL}
                width={48}
                height={64}
                alt={item.mediaTitle ?? ""}
                className="h-16 w-12 shrink-0 rounded object-cover"
              />
            ) : (
              <span className="flex h-16 w-12 shrink-0 items-center justify-center rounded bg-muted">
                <Icon icon={item.icon ?? "lucide:activity"} className="size-5 text-muted-foreground" />
              </span>
            )}

            <span className="min-w-0 truncate text-sm font-medium">{item.mediaTitle}</span>
          </Link>
        )}

        <ActivityReactions
          activityId={item.activityId}
          reactions={item.reactions}
          likes={item.likes}
          onReact={onReact}
          isReacting={isReacting}
        />
      </CardContent>

      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("feed:postDeleteConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("feed:postDeleteConfirmDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsConfirmingDelete(false)}>
              {t("common:cancel")}
            </Button>
            <Button variant="destructive" size="sm" disabled={deletePost.isPending} onClick={handleDelete}>
              {t("feed:removeConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
