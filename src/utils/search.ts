import type { AxiosResponse } from "axios";
import { parseAsArrayOf, parseAsFloat, parseAsString } from "nuqs";
import type { ContentType, FilterParams } from "@/components/layouts/filters";

export function buildSearchUrl(contentType: ContentType, query: string, filters: FilterParams, page: number): string {
  const qs = new URLSearchParams();

  if (page > 1) qs.set("page", String(page));
  if (query) qs.set("query", query);
  if (filters.type) qs.set("type", filters.type);
  if (filters.status) qs.set("status", filters.status);
  if (filters.genres?.length) qs.set("genres", filters.genres.join(","));
  if (filters.year) qs.set("year", filters.year);
  if (filters.sort) qs.set("orderBy", filters.sort);
  if (filters.gameMode) qs.set("gameMode", filters.gameMode);
  if (filters.platforms?.length) qs.set("platforms", filters.platforms.join(","));
  if (filters.minTgScore != null) qs.set("minTgScore", String(filters.minTgScore));

  const qsStr = qs.toString();
  return qsStr ? `/${contentType}/search?${qsStr}` : `/${contentType}/search`;
}

export const FILTER_QUERY_PARSERS = {
  minTgScore: parseAsFloat,
  format: parseAsString,
  status: parseAsString,
  genres: parseAsArrayOf(parseAsString),
  year: parseAsString,
  sort: parseAsString,
  gameMode: parseAsString,
  platforms: parseAsArrayOf(parseAsString),
};

export type FilterQueryState = {
  minTgScore: number | null;
  format: string | null;
  status: string | null;
  genres: string[] | null;
  year: string | null;
  sort: string | null;
  gameMode: string | null;
  platforms: string[] | null;
};

export const CLEARED_FILTER_QUERY: FilterQueryState = {
  minTgScore: null,
  format: null,
  status: null,
  genres: null,
  year: null,
  sort: null,
  gameMode: null,
  platforms: null,
};

export function getItemsFromPage(page: AxiosResponse, contentType: ContentType) {
  const data = page?.data;
  switch (contentType) {
    case "movie":
      return data?.movies?.items ?? [];
    case "tv":
      return data?.tvShows?.items ?? [];
    case "anime":
      return data?.animes?.items ?? [];
    case "manga":
      return data?.mangas?.items ?? [];
    case "book":
      return data?.books?.items ?? [];
    case "game":
      return data?.games?.items ?? [];
    default:
      return [];
  }
}

export function getPaginationFromPage(page: AxiosResponse, contentType: ContentType) {
  const data = page?.data;
  switch (contentType) {
    case "anime":
      return data?.animes;
    case "manga":
      return data?.mangas;
    case "book":
      return data?.books;
    case "game":
      return data?.games;
    case "movie":
      return data?.movies;
    case "tv":
      return data?.tvShows;
    default:
      return undefined;
  }
}
