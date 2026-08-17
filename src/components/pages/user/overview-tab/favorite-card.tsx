import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import type { FavoriteTarget } from "@/hooks/favorite";
import type { ApiTypes } from "@/lib/api";

const ROUTE_BY_CONTENT: Record<
  FavoriteTarget,
  "/anime/$slug" | "/manga/$slug" | "/tv/$slug" | "/movie/$slug" | "/game/$slug" | "/book/$slug" | "/cast/$slug"
> = {
  anime: "/anime/$slug",
  manga: "/manga/$slug",
  tv: "/tv/$slug",
  movie: "/movie/$slug",
  game: "/game/$slug",
  book: "/book/$slug",
  person: "/cast/$slug",
};

export interface FavoriteItem {
  id: string;
  title: string;
  image: string;
  score?: number | null;
  contentType: FavoriteTarget;
  slug: string;
  mediaId: string;
}

export function favoriteToItem(favorite: ApiTypes.Favorite): FavoriteItem | null {
  switch (favorite.type) {
    case "Anime":
      if (!favorite.anime) return null;
      return {
        id: favorite.id,
        title: favorite.anime.title,
        image: favorite.anime.imageUrl ?? "",
        contentType: "anime",
        slug: String(favorite.anime.malId),
        mediaId: favorite.anime.id,
      };
    case "Manga":
      if (!favorite.manga) return null;
      return {
        id: favorite.id,
        title: favorite.manga.title,
        image: favorite.manga.imageUrl ?? "",
        contentType: "manga",
        slug: String(favorite.manga.anilistId ?? favorite.manga.malId),
        mediaId: favorite.manga.id,
      };
    case "TVShow":
      if (!favorite.tvShow) return null;
      return {
        id: favorite.id,
        title: favorite.tvShow.name,
        image: favorite.tvShow.posterUrl ?? "",
        contentType: "tv",
        slug: String(favorite.tvShow.tmdbId),
        mediaId: favorite.tvShow.id,
      };
    case "Movie":
      if (!favorite.movie) return null;
      return {
        id: favorite.id,
        title: favorite.movie.title,
        image: favorite.movie.posterUrl ?? "",
        contentType: "movie",
        slug: String(favorite.movie.tmdbId),
        mediaId: favorite.movie.id,
      };
    case "Game":
      if (!favorite.game) return null;
      return {
        id: favorite.id,
        title: favorite.game.name,
        image: favorite.game.coverUrl ?? "",
        contentType: "game",
        slug: String(favorite.game.igdbId),
        mediaId: favorite.game.id,
      };
    case "Book":
      if (!favorite.book) return null;
      return {
        id: favorite.id,
        title: favorite.book.title,
        image: favorite.book.imageUrl ?? "",
        contentType: "book",
        slug: String(favorite.book.hardcoverId),
        mediaId: favorite.book.id,
      };
    case "Person":
      if (!favorite.person) return null;
      return {
        id: favorite.id,
        title: favorite.person.name,
        image: favorite.person.imageUrl ?? "",
        contentType: "person",
        slug: favorite.person.slug,
        mediaId: favorite.person.id,
      };
    default:
      return null;
  }
}

interface FavoriteCardProps {
  item: FavoriteItem;
  onRemove?: (item: FavoriteItem) => void;
  isRemoving?: boolean;
}

export function FavoriteCard({ item, onRemove, isRemoving }: FavoriteCardProps) {
  return (
    <Link to={ROUTE_BY_CONTENT[item.contentType]} params={{ slug: item.slug }} className="space-y-2">
      <div className="relative rounded-lg border border-border overflow-hidden aspect-3/4 group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:opacity-80"
          style={{ backgroundImage: `url("${item.image}")` }}
        />
        {onRemove && (
          <button
            type="button"
            disabled={isRemoving}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(item);
            }}
            className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 disabled:opacity-50"
          >
            <Icon icon="lucide:x" className="size-4" />
          </button>
        )}
      </div>
      <p className="font-bold text-card-foreground hover:text-primary transition-colors line-clamp-2">{item.title}</p>
    </Link>
  );
}
