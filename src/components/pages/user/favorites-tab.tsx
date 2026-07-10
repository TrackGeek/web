import { Icon } from "@iconify/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FavoriteCard, type FavoriteItem, favoriteToItem } from "@/components/pages/user/overview-tab/favorite-card";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites, useRemoveFavorite } from "@/hooks/favorite";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { useDebounce } from "@/lib/utils/useDebounce";

const FAVORITE_TYPE_ORDER: { type: ApiTypes.FavoriteType; labelKey: string }[] = [
  { type: "Anime", labelKey: "common:types.anime_other" },
  { type: "Manga", labelKey: "common:types.manga_other" },
  { type: "TVShow", labelKey: "common:types.tv_other" },
  { type: "Movie", labelKey: "common:types.movie_other" },
  { type: "Game", labelKey: "common:types.game_other" },
  { type: "Book", labelKey: "common:types.book_other" },
];

export function UserFavoritesTab({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const session = useSession();

  const isOwner = session.data?.user?.id === userId;

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 600);

  const favoritesQuery = useFavorites(userId, debouncedQuery);
  const removeFavorite = useRemoveFavorite();

  const favorites = favoritesQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const groups = FAVORITE_TYPE_ORDER.map(({ type, labelKey }) => ({
    type,
    labelKey,
    items: favorites
      .filter((favorite) => favorite.type === type)
      .map(favoriteToItem)
      .filter((item): item is FavoriteItem => item !== null),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      {favoritesQuery.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <FavoriteSkeleton key={index} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="lucide:heart" />
            </EmptyMedia>
            <EmptyTitle>{t("user:noFavorites")}</EmptyTitle>
            <EmptyDescription>{t("user:noFavoritesDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        groups.map((group) => (
          <div key={group.type} className="flex flex-col gap-3">
            <h4 className="text-lg font-semibold text-card-foreground">{t(group.labelKey)}</h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {group.items.map((item) => (
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
          </div>
        ))
      )}

      {favoritesQuery.hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => favoritesQuery.fetchNextPage()}
            disabled={favoritesQuery.isFetchingNextPage}
          >
            {favoritesQuery.isFetchingNextPage ? t("user:loading") : t("user:loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}

function FavoriteSkeleton() {
  return <Skeleton className="aspect-[3/4] w-full rounded-2xl" />;
}
