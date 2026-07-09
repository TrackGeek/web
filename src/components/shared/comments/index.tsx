import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { type CommentTarget, useAddComment, useComments, useDeleteComment } from "@/hooks/comment.ts";
import type { ApiTypes } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll.ts";
import { Markdown } from "./markdown";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MAX_LENGTH = 500;

type CommentsProps = CommentTarget & {
  className?: string;
  canModerate?: boolean;
};

export function Comments({ className, canModerate = false, ...target }: CommentsProps) {
  const { t } = useTranslation();
  const session = useSession();
  const sessionUserId = session.data?.user?.id;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useComments(target);
  const addComment = useAddComment(target);
  const deleteComment = useDeleteComment(target);

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  const schema = useMemo(
    () =>
      z.object({
        content: z.string().trim().min(1, t("comments:required")).max(MAX_LENGTH, t("comments:tooLong")),
      }),
    [t],
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { content: "" },
  });

  const content = form.watch("content") ?? "";

  const comments = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const canComment = Boolean(sessionUserId);

  function handleSubmit({ content }: z.infer<typeof schema>) {
    addComment.mutate(content.trim(), {
      onSuccess: () => {
        form.reset();
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
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:message-circle" className="size-5" />
          
          {t("comments:title")}
          
          {total > 0 && <span className="text-sm text-muted-foreground">{t("comments:count", { count: total })}</span>}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {canComment ? (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-2">
            <Field>
              <Textarea
                placeholder={t("comments:placeholder")}
                maxLength={MAX_LENGTH}
                disabled={addComment.isPending}
                aria-invalid={Boolean(form.formState.errors.content)}
                className="min-h-20 resize-none"
                {...form.register("content")}
              />
              {form.formState.errors.content?.message && <FieldError>{form.formState.errors.content.message}</FieldError>}
            </Field>
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs text-muted-foreground">
                {content.length}/{MAX_LENGTH}
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={!form.formState.isValid || addComment.isPending}
                className="gap-2"
              >
                {t("common:send")}
                <Icon icon="lucide:send" className="size-3" />
              </Button>
            </div>
          </form>
        ) : (
          !sessionUserId && <p className="text-sm text-muted-foreground">{t("comments:loginToComment")}</p>
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
                canDelete={comment.userId === sessionUserId || canModerate}
                isDeleting={deleteComment.isPending && deleteComment.variables === comment.id}
                onDelete={() => handleDelete(comment.id)}
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

function CommentItem({
  comment,
  canDelete,
  isDeleting,
  onDelete,
}: {
  comment: ApiTypes.Comment;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <article className="group flex gap-3">
      <Avatar className="size-9 border border-border/50">
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

      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Link
              to="/user/$username"
              params={{ username: comment.user.username }}
              className="text-sm font-semibold text-card-foreground hover:underline"
            >
              {comment.user.username}
            </Link>
            <time className="text-xs text-muted-foreground" dateTime={comment.createdAt}>
              • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </time>
          </div>

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="size-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <Icon icon="lucide:trash-2" className="size-4" />
            </Button>
          )}
        </div>

        <Markdown>{comment.content}</Markdown>
      </div>
    </article>
  );
}
