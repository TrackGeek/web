import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FavoriteCard, type FavoriteItem, favoriteToItem } from "@/components/pages/user/overview-tab/favorite-card";
import { SearchInput } from "@/components/shared/search-input";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentTypes } from "@/hooks/content-type";
import { useFavorites, useRemoveFavorite } from "@/hooks/favorite";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { CONTENT_TYPE_API, type ContentTypeSlug, toContentTypeSlug } from "@/lib/content-types";
import { useDebounce } from "@/lib/utils/useDebounce";

const CONTENT_TYPES: { type: ApiTypes.FavoriteType; slug: ContentTypeSlug | null; labelKey: string }[] = [
  { type: "Anime", slug: "anime", labelKey: "common:types.anime_other" },
  { type: "Manga", slug: "manga", labelKey: "common:types.manga_other" },
  { type: "TVShow", slug: "tv", labelKey: "common:types.tv_other" },
  { type: "Movie", slug: "movie", labelKey: "common:types.movie_other" },
  { type: "Game", slug: "game", labelKey: "common:types.game_other" },
  { type: "Book", slug: "book", labelKey: "common:types.book_other" },
  { type: "Person", slug: null, labelKey: "common:types.cast_other" },
];

export function UserFavoritesTab({
  userId,
  initialContentType = "Anime",
}: {
  userId: string;
  initialContentType?: ApiTypes.FavoriteType;
}) {
  const { t } = useTranslation();
  const session = useSession();

  const isOwner = session.data?.user?.id === userId;

  const [contentType, setContentType] = useState<ApiTypes.FavoriteType>(initialContentType);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 600);

  const { visible, hiddenClass } = useContentTypes();

  useEffect(() => {
    if (contentType === "Person") return;

    const slug = toContentTypeSlug(contentType);

    if (slug && visible.includes(slug)) return;

    setContentType(CONTENT_TYPE_API[visible[0]]);
  }, [visible, contentType]);

  const favoritesQuery = useFavorites(userId, debouncedQuery);
  const removeFavorite = useRemoveFavorite();

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && favoritesQuery.hasNextPage && !favoritesQuery.isFetchingNextPage) {
          favoritesQuery.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [favoritesQuery.hasNextPage, favoritesQuery.isFetchingNextPage, favoritesQuery.fetchNextPage]);

  const favorites = useMemo(
    () => favoritesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [favoritesQuery.data],
  );

  const items = useMemo(
    () =>
      favorites
        .filter((favorite) => favorite.type === contentType)
        .map(favoriteToItem)
        .filter((item): item is FavoriteItem => item !== null),
    [favorites, contentType],
  );

  const handleContentTypeChange = (value: string) => {
    setContentType(value as ApiTypes.FavoriteType);
    setSearchQuery("");
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
                {CONTENT_TYPES.map(({ type, slug, labelKey }) => (
                  <SelectItem key={type} value={type} className={slug ? hiddenClass(slug) : undefined}>
                    {t(labelKey)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      {favoritesQuery.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <FavoriteSkeleton key={index} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon={debouncedQuery.trim() ? "lucide:search-x" : "lucide:heart"} />
            </EmptyMedia>
            <EmptyTitle>{debouncedQuery.trim() ? t("common:noResults") : t("user:noFavorites")}</EmptyTitle>
            <EmptyDescription>
              {debouncedQuery.trim() ? t("common:noResultsDescription") : t("user:noFavoritesDescription")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((item) => (
            <FavoriteCard
              key={item.id}
              item={item}
              onRemove={
                isOwner
                  ? (favorite) =>
                      removeFavorite.mutate({ contentType: favorite.contentType, mediaId: favorite.mediaId })
                  : undefined
              }
              isRemoving={removeFavorite.isPending}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} />

      {favoritesQuery.isFetchingNextPage && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <FavoriteSkeleton key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function FavoriteSkeleton() {
  return <Skeleton className="aspect-3/4 w-full rounded-lg" />;
}
