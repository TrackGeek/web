import { Link } from "@tanstack/react-router";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface FavoriteItem {
  id: string;
  title: string;
  image: string;
  score?: number | null;
}

export function favoriteToItem(favorite: ApiTypes.Favorite): FavoriteItem | null {
  switch (favorite.type) {
    case "Anime":
      if (!favorite.anime) return null;
      return { id: favorite.id, title: favorite.anime.title, image: favorite.anime.imageUrl ?? "" };
    case "Manga":
      if (!favorite.manga) return null;
      return { id: favorite.id, title: favorite.manga.title, image: favorite.manga.imageUrl ?? "" };
    case "TVShow":
      if (!favorite.tvShow) return null;
      return { id: favorite.id, title: favorite.tvShow.name, image: favorite.tvShow.posterUrl ?? "" };
    case "Movie":
      if (!favorite.movie) return null;
      return { id: favorite.id, title: favorite.movie.title, image: favorite.movie.posterUrl ?? "" };
    case "Game":
      if (!favorite.game) return null;
      return { id: favorite.id, title: favorite.game.name, image: favorite.game.coverUrl ?? "" };
    case "Book":
      if (!favorite.book) return null;
      return { id: favorite.id, title: favorite.book.title, image: favorite.book.imageUrl ?? "" };
    default:
      return null;
  }
}

export function FavoriteCard({ item }: { item: FavoriteItem }) {
  return (
    <Link
      to="/"
      search={{ landing: "true" }}
      className={cn("bg-card rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-shadow")}
    >
      <img src={item.image} alt={item.title} className="w-full h-44 object-cover" />
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-card-foreground truncate">{item.title}</h3>
          {typeof item.score === "number" && (
            <span className="text-sm font-medium text-muted-foreground">{item.score}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
