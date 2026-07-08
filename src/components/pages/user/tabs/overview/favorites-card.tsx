import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useFavorites } from "@/hooks/favorite";
import { FavoriteCard, type FavoriteItem, favoriteToItem } from "./favorite-card";

interface FavoritesCardProps {
  userId: string;
  onSeeMore?: () => void;
}

export function FavoritesCard({ userId, onSeeMore }: FavoritesCardProps) {
  const { t } = useTranslation();

  const favoritesQuery = useFavorites(userId);

  const firstPage = favoritesQuery.data?.pages[0];
  const total = firstPage?.total ?? 0;
  const items = (firstPage?.items ?? [])
    .map(favoriteToItem)
    .filter((item): item is FavoriteItem => item !== null)
    .slice(0, 6);

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-semibold text-card-foreground">{t("user:favorites")}</h4>

        {total > 6 && (
          <button
            type="button"
            onClick={onSeeMore}
            className="cursor-pointer flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("user:seeMore")}
            <Icon icon="lucide:arrow-right" className="size-4" />
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <FavoriteCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground leading-relaxed">{t("user:noFavorites")}</p>
      )}
    </div>
  );
}
