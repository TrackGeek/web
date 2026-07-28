import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { formatDistanceToNow } from "date-fns";
import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  type AddCommentInput,
  type CommentTarget,
  useAddComment,
  useComments,
  useDeleteComment,
  useToggleCommentReaction,
} from "@/hooks/comment.ts";
import type { ApiTypes } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { QUICK_REACTIONS } from "@/lib/reactions";
import { cn } from "@/lib/utils";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll.ts";
import { Markdown } from "./markdown";

const MAX_LENGTH = 500;

type CommentsProps = CommentTarget & {
  containerClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  canModerate?: boolean;
  showTitle?: boolean;
};

type AddComment = ReturnType<typeof useAddComment>;
type DeleteComment = ReturnType<typeof useDeleteComment>;
type ToggleReaction = ReturnType<typeof useToggleCommentReaction>;

export function Comments({
  containerClassName,
  headerClassName,
  contentClassName,
  showTitle = true,
  canModerate = false,
  ...target
}: CommentsProps) {
  const { t } = useTranslation();
  const session = useSession();
  const sessionUserId = session.data?.user?.id;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useComments(target);
  const addComment = useAddComment(target);
  const deleteComment = useDeleteComment(target);
  const toggleReaction = useToggleCommentReaction(target);

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  const comments = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const canComment = Boolean(sessionUserId);

  function handleAdd(input: AddCommentInput, onSuccess?: () => void) {
    addComment.mutate(input, {
      onSuccess: () => {
        onSuccess?.();
        toast.success(t("comments:addSuccess"));
      },
      onError: () => toast.error(t("comments:addError")),
    });
  }

  function handleDelete(commentId: string) {
    deleteComment.mutate(commentId, {
      onSuccess: () => toast.success(t("comments:deleteSuccess")),
      onError: () => toast.error(t("comments:deleteError")),
    });
  }

  return (
    <Card className={containerClassName}>
      {showTitle && (
        <CardHeader className={headerClassName}>
          <CardTitle>
            <Icon icon="lucide:message-circle" className="size-5" />

            {t("comments:title")}

            {total > 0 && (
              <span className="text-sm text-muted-foreground">{t("comments:count", { count: total })}</span>
            )}
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className={cn("flex flex-col gap-4", contentClassName)}>
        {canComment ? (
          <CommentForm isPending={addComment.isPending} onSubmit={(input, done) => handleAdd(input, done)} />
        ) : (
          <p className="text-sm text-muted-foreground">{t("comments:loginToComment")}</p>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon="lucide:message-circle" />
              </EmptyMedia>
              <EmptyTitle>{t("comments:empty")}</EmptyTitle>
              {canComment && <EmptyDescription>{t("comments:emptyDescription")}</EmptyDescription>}
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                canComment={canComment}
                canModerate={canModerate}
                sessionUserId={sessionUserId}
                addComment={addComment}
                deleteComment={deleteComment}
                toggleReaction={toggleReaction}
                onAdd={handleAdd}
                onDelete={handleDelete}
              />
            ))}

            <div ref={sentinelRef} className="h-px" />
            {isFetchingNextPage && <Skeleton className="h-4 w-full" />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommentForm({
  isPending,
  onSubmit,
  autoFocus = false,
  onCancel,
}: {
  isPending: boolean;
  onSubmit: (input: AddCommentInput, done: () => void) => void;
  autoFocus?: boolean;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const spoilerId = useId();

  const schema = useMemo(
    () =>
      z.object({
        content: z.string().trim().min(1, t("comments:required")).max(MAX_LENGTH, t("comments:tooLong")),
        isSpoiler: z.boolean(),
      }),
    [t],
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { content: "", isSpoiler: false },
  });

  const content = form.watch("content") ?? "";
  const isSpoiler = form.watch("isSpoiler");

  function handleSubmit({ content, isSpoiler }: z.infer<typeof schema>) {
    onSubmit({ content: content.trim(), isSpoiler }, () => form.reset());
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-2">
      <Field>
        <Textarea
          placeholder={t("comments:placeholder")}
          maxLength={MAX_LENGTH}
          disabled={isPending}
          autoFocus={autoFocus}
          aria-invalid={Boolean(form.formState.errors.content)}
          className="min-h-20 resize-none"
          {...form.register("content")}
        />
        {form.formState.errors.content?.message && <FieldError>{form.formState.errors.content.message}</FieldError>}
      </Field>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={spoilerId} className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            id={spoilerId}
            checked={isSpoiler}
            onCheckedChange={(checked) => form.setValue("isSpoiler", checked === true)}
            disabled={isPending}
          />
          {t("comments:spoiler")}
        </label>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {content.length}/{MAX_LENGTH}
          </span>
          {onCancel && (
            <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={isPending}>
              {t("common:cancel")}
            </Button>
          )}
          <Button type="submit" size="sm" disabled={!form.formState.isValid || isPending} className="gap-2">
            {t("common:send")}
            <Icon icon="lucide:send" className="size-3" />
          </Button>
        </div>
      </div>
    </form>
  );
}

function CommentItem({
  comment,
  canComment,
  canModerate,
  sessionUserId,
  addComment,
  deleteComment,
  toggleReaction,
  onAdd,
  onDelete,
}: {
  comment: ApiTypes.Comment;
  canComment: boolean;
  canModerate: boolean;
  sessionUserId?: string;
  addComment: AddComment;
  deleteComment: DeleteComment;
  toggleReaction: ToggleReaction;
  onAdd: (input: AddCommentInput, onSuccess?: () => void) => void;
  onDelete: (commentId: string) => void;
}) {
  const { t } = useTranslation();
  const [replying, setReplying] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const canDelete = comment.userId === sessionUserId || canModerate;
  const isDeleting = deleteComment.isPending && deleteComment.variables === comment.id;
  const replies = comment.replies ?? [];

  const reactionList = comment.reactions ?? [];
  const currentReaction = sessionUserId ? reactionList.find((r) => r.user.id === sessionUserId) : undefined;
  const reactionCounts = reactionList.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});
  const isReacting = toggleReaction.isPending && toggleReaction.variables?.commentId === comment.id;

  return (
    <article className="group flex gap-3">
      <Avatar className="size-9 shrink-0 border border-border/50">
        {comment.user.profile.avatarUrl ? (
          <Image
            className="aspect-square size-full"
            src={comment.user.profile.avatarUrl}
            width={36}
            height={36}
            alt={comment.user.username}
          />
        ) : (
          <AvatarFallback>{(comment.user.username || "?").charAt(0).toUpperCase()}</AvatarFallback>
        )}
      </Avatar>

      <div className="min-w-0 flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-1.5">
            <Link
              to="/user/$username"
              params={{ username: comment.user.username }}
              className="truncate text-sm font-semibold text-card-foreground hover:underline"
            >
              {comment.user.username}
            </Link>
            <time className="shrink-0 text-xs text-muted-foreground" dateTime={comment.createdAt}>
              • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </time>
          </div>

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => onDelete(comment.id)}
              disabled={isDeleting}
              className="size-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <Icon icon="lucide:trash-2" className="size-4" />
            </Button>
          )}
        </div>

        {comment.isSpoiler && !revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="relative w-full overflow-hidden rounded-md border border-dashed border-border bg-muted/40 py-4 text-left"
            aria-label={t("comments:spoilerReveal")}
          >
            <div className="pointer-events-none select-none px-3 blur-sm">
              <Markdown>{comment.content}</Markdown>
            </div>
            <span className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Icon icon="lucide:eye-off" className="size-3.5" />
              {t("comments:spoilerReveal")}
            </span>
          </button>
        ) : (
          <Markdown>{comment.content}</Markdown>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex flex-wrap items-center gap-1">
            {QUICK_REACTIONS.map((emoji) => {
              const count = reactionCounts[emoji] ?? 0;
              const active = currentReaction?.emoji === emoji;

              if (count === 0 && !active && !sessionUserId) return null;

              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => toggleReaction.mutate({ commentId: comment.id, emoji, currentReaction })}
                  disabled={isReacting || !sessionUserId}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 hover:border-primary/50 hover:bg-muted",
                  )}
                >
                  <span className="leading-none">{emoji}</span>
                  {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
                </button>
              );
            })}
          </div>

          {canComment && (
            <button
              type="button"
              onClick={() => setReplying((value) => !value)}
              className="flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-card-foreground"
            >
              <Icon icon="lucide:reply" className="size-3.5" />
              {t("common:reply")}
            </button>
          )}
        </div>

        {replying && (
          <div className="mt-2">
            <CommentForm
              isPending={addComment.isPending}
              autoFocus
              onCancel={() => setReplying(false)}
              onSubmit={(input, done) =>
                onAdd({ ...input, parentId: comment.id }, () => {
                  done();
                  setReplying(false);
                })
              }
            />
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-3 flex flex-col gap-4 border-l border-border/50 pl-4">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                canComment={canComment}
                canModerate={canModerate}
                sessionUserId={sessionUserId}
                addComment={addComment}
                deleteComment={deleteComment}
                toggleReaction={toggleReaction}
                onAdd={onAdd}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
