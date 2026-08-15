import type { ApiTypes } from "@/lib/api";

type ListItemRoute = "/tv/$slug" | "/movie/$slug" | "/anime/$slug" | "/manga/$slug" | "/game/$slug" | "/book/$slug";

export interface ListItemLink {
  to: ListItemRoute;
  slug: string;
  title: string;
  image: string;
}

export function listItemToLink(item: ApiTypes.ListItem): ListItemLink | null {
  if (item.tvShow) {
    return {
      to: "/tv/$slug",
      slug: String(item.tvShow.tmdbId),
      title: item.tvShow.name,
      image: item.tvShow.posterUrl ?? "",
    };
  }

  if (item.movie) {
    return {
      to: "/movie/$slug",
      slug: String(item.movie.tmdbId),
      title: item.movie.title,
      image: item.movie.posterUrl ?? "",
    };
  }

  if (item.anime) {
    return {
      to: "/anime/$slug",
      slug: String(item.anime.malId),
      title: item.anime.title,
      image: item.anime.imageUrl ?? "",
    };
  }

  if (item.manga) {
    return {
      to: "/manga/$slug",
      slug: String(item.manga.anilistId ?? item.manga.malId),
      title: item.manga.title,
      image: item.manga.imageUrl ?? "",
    };
  }

  if (item.game) {
    return {
      to: "/game/$slug",
      slug: String(item.game.igdbId),
      title: item.game.name,
      image: item.game.coverUrl ?? "",
    };
  }

  if (item.book) {
    return {
      to: "/book/$slug",
      slug: String(item.book.hardcoverId),
      title: item.book.title,
      image: item.book.imageUrl ?? "",
    };
  }

  return null;
}

export const LIST_TYPE_LABEL_KEY: Record<ApiTypes.ListType, string> = {
  Anime: "anime",
  Manga: "manga",
  TVShow: "tv",
  Movie: "movie",
  Game: "game",
  Book: "book",
};

const LIST_ID_FIELD_BY_TYPE: Record<ApiTypes.ListType, keyof ApiTypes.ListItem> = {
  Anime: "anime",
  Manga: "manga",
  TVShow: "tvShow",
  Movie: "movie",
  Game: "game",
  Book: "book",
};

const LIST_REQUEST_ID_FIELD_BY_TYPE: Record<ApiTypes.ListType, keyof ApiTypes.AddItemToListRequest> = {
  Anime: "animeId",
  Manga: "mangaId",
  TVShow: "tvShowId",
  Movie: "movieId",
  Game: "gameId",
  Book: "bookId",
};

/**
 * Builds the body used to remove an item from a list, given the list type and the item.
 * Returns null when the item has no entity matching the list type.
 */
export function buildRemoveItemRequest(
  list: Pick<ApiTypes.List, "id" | "type">,
  item: ApiTypes.ListItem,
): ApiTypes.RemoveItemFromListRequest | null {
  const entity = item[LIST_ID_FIELD_BY_TYPE[list.type]] as { id: string } | null;

  if (!entity) {
    return null;
  }

  return {
    type: list.type,
    listId: list.id,
    [LIST_REQUEST_ID_FIELD_BY_TYPE[list.type]]: entity.id,
  };
}
