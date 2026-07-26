import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReviewItem } from "@/components/pages/details/review-item";
import { ReviewModal } from "@/components/shared/modals/review";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  REVIEW_CONTENT,
  reviewMediaImage,
  reviewMediaTitle,
  useDeleteReview,
  useToggleReviewReaction,
  useUserReviews,
} from "@/hooks/review";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { useDebounce } from "@/lib/utils/useDebounce";

const CONTENT_TYPES: { type: ApiTypes.ReviewContentType; labelKey: string }[] = [
  { type: "movie", labelKey: "common:types.movie_other" },
  { type: "tv", labelKey: "common:types.tv_other" },
  { type: "anime", labelKey: "common:types.anime_other" },
  { type: "game", labelKey: "common:types.game_other" },
  { type: "book", labelKey: "common:types.book_other" },
  { type: "manga", labelKey: "common:types.manga_other" },
];

export function UserReviewsTab({
  userId,
  initialContentType = "movie",
}: {
  userId: string;
  initialContentType?: ApiTypes.ReviewContentType;
}) {
  const { t } = useTranslation();
  const session = useSession();
  const isOwner = session.data?.user?.id === userId;

  const [contentType, setContentType] = useState<ApiTypes.ReviewContentType>(initialContentType);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<ApiTypes.Review | null>(null);
  const [deleting, setDeleting] = useState<ApiTypes.Review | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 600);

  const reviewsQuery = useUserReviews(contentType, userId, debouncedQuery);
  const deleteReview = useDeleteReview(contentType, userId);
  const toggleReaction = useToggleReviewReaction(contentType, userId);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && reviewsQuery.hasNextPage && !reviewsQuery.isFetchingNextPage) {
          reviewsQuery.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reviewsQuery.hasNextPage, reviewsQuery.isFetchingNextPage, reviewsQuery.fetchNextPage]);

  const reviews = useMemo(() => reviewsQuery.data?.pages.flatMap((page) => page.items) ?? [], [reviewsQuery.data]);

  const handleContentTypeChange = (value: string) => {
    setContentType(value as ApiTypes.ReviewContentType);
    setSearchQuery("");
  };

  const handleConfirmDelete = () => {
    if (!deleting) return;

    deleteReview.mutate(deleting.id, {
      onSuccess: () => setDeleting(null),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row gap-5 sm:items-end">
        <div className="w-full sm:w-40">
          <Select value={contentType} onValueChange={handleContentTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CONTENT_TYPES.map(({ type, labelKey }) => (
                  <SelectItem key={type} value={type}>
                    {t(labelKey)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      {reviewsQuery.isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ReviewSkeleton key={index} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="lucide:star" />
            </EmptyMedia>
            <EmptyTitle>{t("library:noReviews")}</EmptyTitle>
            <EmptyDescription>{t("library:noReviewsDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col divide-y gap-5 divide-border/30">
          {reviews.map((review) => {
            const mediaContent = REVIEW_CONTENT[contentType];
            const mediaData = review[mediaContent.mediaKey as keyof ApiTypes.Review];
            const entityId = mediaData?.[mediaContent.entityId as keyof typeof mediaData];
            return (
              <ReviewItem
                key={review.id}
                coverURL={reviewMediaImage(contentType, review)}
                reviewText={review.summary ?? ""}
                notes={review.notes}
                story={mediaContent.hasStory ? review.story : undefined}
                routeName={mediaContent.routeName}
                entityId={entityId}
                date={new Date(review.createdAt)}
                criteries={REVIEW_CONTENT[contentType].mapCriteries(review)}
                reviewName={reviewMediaTitle(contentType, review)}
                reviewId={review.id}
                reactions={review.reactions}
                onReact={(emoji, currentReaction) =>
                  toggleReaction.mutate({ reviewId: review.id, currentReaction, emoji })
                }
                isReacting={toggleReaction.isPending && toggleReaction.variables?.reviewId === review.id}
                onEdit={isOwner ? () => setEditing(review) : undefined}
                onDelete={isOwner ? () => setDeleting(review) : undefined}
                isDeleting={deleteReview.isPending && deleteReview.variables === review.id}
              />
            );
          })}
        </div>
      )}

      <div ref={sentinelRef} />

      {reviewsQuery.isFetchingNextPage && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <ReviewSkeleton key={index} />
          ))}
        </div>
      )}

      {editing && (
        <ReviewModal
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          contentType={contentType}
          review={editing}
          userId={userId}
          mediaTitle={reviewMediaTitle(contentType, editing)}
          mediaImage={reviewMediaImage(contentType, editing)}
          onSaved={() => setEditing(null)}
        />
      )}

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("user:deleteReviewTitle")}</DialogTitle>
            <DialogDescription>{t("user:deleteReviewConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleting(null)}>
              {t("user:cancel")}
            </Button>
            <Button variant="destructive" size="sm" disabled={deleteReview.isPending} onClick={handleConfirmDelete}>
              {t("feed:removeConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="bg-linear-to-br from-muted/50 to-muted flex flex-col gap-4 p-4 rounded-xl border border-border">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );
}
