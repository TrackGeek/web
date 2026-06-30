import { useTranslation } from "react-i18next";
import { FavoriteCard, type FavoriteItem, favoriteToItem } from "@/components/pages/user/tabs/overview/favorite-card";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/favorite";
import type { ApiTypes } from "@/lib/api";

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

  const favoritesQuery = useFavorites(userId);

  const favorites = favoritesQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const groups = FAVORITE_TYPE_ORDER.map(({ type, labelKey }) => ({
    type,
    labelKey,
    items: favorites
      .filter((favorite) => favorite.type === type)
      .map(favoriteToItem)
      .filter((item): item is FavoriteItem => item !== null),
  })).filter((group) => group.items.length > 0);

  if (favoritesQuery.isLoading) {
    return <p className="text-muted-foreground">{t("user:loading")}</p>;
  }

  if (groups.length === 0) {
    return <p className="text-muted-foreground leading-relaxed">{t("user:noFavorites")}</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.type} className="flex flex-col gap-3">
          <h4 className="text-lg font-semibold text-card-foreground">{t(group.labelKey)}</h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {group.items.map((item) => (
              <FavoriteCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}

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
