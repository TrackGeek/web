import { Icon } from "@iconify/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFavorites } from "@/hooks/favorite";
import { FavoriteCard, type FavoriteItem, favoriteToItem } from "./favorite-card";

const VISIBLE_ITEMS = 6;

function pickRandom<T>(source: T[], count: number) {
  const pool = [...source];

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count);
}

interface FavoritesCardProps {
  userId: string;
  onSeeMore?: () => void;
}

export function FavoritesCard({ userId, onSeeMore }: FavoritesCardProps) {
  const { t } = useTranslation();

  const favoritesQuery = useFavorites(userId);

  const firstPage = favoritesQuery.data?.pages[0];
  const total = firstPage?.total ?? 0;

  const items = useMemo(() => {
    const available = (firstPage?.items ?? [])
      .map(favoriteToItem)
      .filter((item): item is FavoriteItem => item !== null);

    return pickRandom(available, VISIBLE_ITEMS);
  }, [firstPage]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:heart" className="size-5" />

            {t("user:favorites")}
          </div>

          {total > VISIBLE_ITEMS && (
            <button
              type="button"
              onClick={onSeeMore}
              className="cursor-pointer flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t("user:seeMore")}
              <Icon icon="lucide:arrow-right" className="size-4" />
            </button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {items.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {items.map((item) => (
              <FavoriteCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground leading-relaxed">{t("user:noFavorites")}</p>
        )}
      </CardContent>
    </Card>
  );
}
