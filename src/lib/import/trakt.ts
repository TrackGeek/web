import axios from "axios";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { BACKUP_MEDIA, mediaIdKey } from "@/lib/backup/schema";
import {
  detailLimiter,
  type ImportRunner,
  MEDIA_NOT_FOUND,
  type OnRetry,
  upsertReview,
  withRetry,
} from "@/lib/import/shared";
import type { TraktEntry, TraktEpisode, TraktList, TraktMediaEntry } from "@/lib/import/trakt-export";

const PAGE_SIZE = 50;
const EPISODES_PER_REQUEST = 100;

type Translate = (key: string, values?: Record<string, unknown>) => string;

class TraktImportError extends Error {
  readonly reason: string;
  readonly detail?: string;

  constructor(reason: string, detail?: string) {
    super(reason === "notFound" ? MEDIA_NOT_FOUND : reason);
    this.reason = reason;
    this.detail = detail;
  }
}

interface Season {
  seasonNumber: number;
  numberOfEpisodes: number;
}

function responseReason(error: unknown): string {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : String(error);

  const data: unknown = error.response?.data;
  if (typeof data === "string") return data;
  if (typeof data === "object" && data !== null) {
    if ("code" in data && typeof data.code === "string") return data.code;
    if ("message" in data && typeof data.message === "string") return data.message;
    if ("code" in data && typeof data.code === "object" && data.code !== null && "message" in data.code) {
      const message = data.code.message;
      return Array.isArray(message) ? message.join("; ") : String(message);
    }
  }

  return error.response ? `HTTP ${error.response.status}` : error.message;
}

function cached<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>): Promise<T> {
  const existing = cache.get(key);
  if (existing) return existing;

  const promise = load().catch((error: unknown) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, promise);
  return promise;
}

export function traktRunner(userId: string, translate: Translate): ImportRunner<TraktEntry> {
  const media = new Map<string, Promise<string>>();
  const lists = new Map<string, Promise<ApiTypes.List>>();
  const seasons = new Map<string, Promise<Season[]>>();
  const completed = new Map<string, Promise<unknown>>();
  const warnings = new Map<string, string[]>();

  const step = async <T>(
    key: string,
    reason: string,
    operation: () => Promise<T>,
    signal: AbortSignal,
    onRetry: OnRetry,
    onResume: () => void,
  ): Promise<T> => {
    return cached(completed, key, () =>
      withRetry(
        async () => {
          if (signal.aborted) throw signal.reason;
          onResume();

          try {
            return await operation();
          } catch (error) {
            if (axios.isAxiosError(error) && [400, 401, 403, 404, 409, 422].includes(error.response?.status ?? 0)) {
              throw new TraktImportError(
                reason === "catalog" && error.response?.status === 404 ? "notFound" : reason,
                responseReason(error),
              );
            }
            throw error;
          }
        },
        signal,
        onRetry,
      ).catch((error: unknown) => {
        if (signal.aborted || error instanceof TraktImportError) throw error;
        throw new TraktImportError(reason, responseReason(error));
      }),
    ) as Promise<T>;
  };

  const resolveMedia = (
    entry: TraktMediaEntry | Extract<TraktEntry, { kind: "listItem" }>,
    signal: AbortSignal,
    onRetry: OnRetry,
    onResume: () => void,
  ) =>
    cached(media, `${entry.contentType}:${entry.tmdbId}`, () =>
      step(
        `catalog:${entry.contentType}:${entry.tmdbId}`,
        "catalog",
        async () => {
          await detailLimiter.acquire(signal);
          const config = BACKUP_MEDIA[entry.contentType];
          const { data } = await api.get(config.detailEndpoint(entry.tmdbId), { signal });
          const id: unknown = data?.[config.mediaKey]?.id;
          if (typeof id !== "string" || !id) throw new TraktImportError("notFound");
          return id;
        },
        signal,
        onRetry,
        onResume,
      ),
    );

  const findList = async (list: TraktList, signal: AbortSignal) => {
    for (let page = 1; ; page++) {
      const { data } = await api.get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId), {
        params: { query: list.name, grouped: false, itemsPerPage: PAGE_SIZE, page },
        signal,
      });
      const existing = data.lists.items.find((item) => item.name === list.name);
      if (existing) return existing;
      if (page >= data.lists.pages) return null;
    }
  };

  const resolveList = (list: TraktList, signal: AbortSignal, onRetry: OnRetry, onResume: () => void) =>
    cached(lists, list.name, () =>
      step(
        `list:${list.name}`,
        "list",
        async () => {
          let existing = await findList(list, signal);
          const type = list.contentType === "movie" ? "Movie" : "TVShow";

          if (!existing) {
            try {
              await api.post(apiEndpoints.list, { name: list.name, type, description: list.description }, { signal });
            } catch (error) {
              if (!axios.isAxiosError(error) || error.response?.status !== 409) throw error;
            }
            existing = await findList(list, signal);
          }

          if (!existing) throw new TraktImportError("list");
          if (existing.type !== type) throw new TraktImportError("listType");
          if (list.description !== undefined && existing.description !== list.description) {
            await api.patch(apiEndpoints.updateList(existing.id), { description: list.description }, { signal });
          }
          return existing;
        },
        signal,
        onRetry,
        onResume,
      ),
    );

  const importMedia = async (entry: TraktMediaEntry, signal: AbortSignal, onRetry: OnRetry, onResume: () => void) => {
    const config = BACKUP_MEDIA[entry.contentType];
    const id = await resolveMedia(entry, signal, onRetry, onResume);
    const idKey = mediaIdKey(entry.contentType);
    const episodes = new Map<string, TraktEpisode>(
      entry.episodes.map((episode) => [`${episode.season}:${episode.episode}`, episode]),
    );

    if (entry.contentType === "tv" && (episodes.size > 0 || entry.plannedSeasons.length > 0)) {
      const available = await cached(seasons, entry.tmdbId, () =>
        step(
          `seasons:${entry.tmdbId}`,
          "episodes",
          async () => {
            await detailLimiter.acquire(signal);
            const { data } = await api.get<{ seasons: Season[] }>(apiEndpoints.getTvShowSeasonDetails(entry.tmdbId), {
              signal,
            });
            if (!Array.isArray(data.seasons)) throw new TraktImportError("episodes");
            return data.seasons;
          },
          signal,
          onRetry,
          onResume,
        ),
      );

      for (const planned of entry.plannedSeasons) {
        if (!available.some((season) => season.seasonNumber === planned)) {
          throw new TraktImportError("seasonNotFound", String(planned));
        }

        for (const season of available) {
          if (season.seasonNumber <= 0 || season.seasonNumber >= planned) continue;
          for (let episode = 1; episode <= season.numberOfEpisodes; episode++) {
            episodes.set(`${season.seasonNumber}:${episode}`, { season: season.seasonNumber, episode });
          }
        }
      }

      const specials = [...episodes.values()].filter((episode) => episode.season === 0);
      if (specials.length > 0) {
        const specialNumbers = available.some((season) => season.seasonNumber === 0)
          ? await step(
              `specials:${entry.tmdbId}`,
              "episodes",
              async () => {
                await detailLimiter.acquire(signal);
                const { data } = await api.get<{ episodes: { episodeNumber: number }[] }>(
                  apiEndpoints.getTvShowSeasonEpisodes(entry.tmdbId, 0),
                  { signal },
                );
                if (!Array.isArray(data.episodes)) throw new TraktImportError("episodes");
                return new Set(data.episodes.map((episode) => episode.episodeNumber));
              },
              signal,
              onRetry,
              onResume,
            )
          : new Set<number>();

        const missing = specials.filter((episode) => !specialNumbers.has(episode.episode));
        warnings.set(
          entry.id,
          missing.map((episode) =>
            translate("settings:import.trakt.specialMissing", { season: episode.season, episode: episode.episode }),
          ),
        );
        for (const episode of missing) episodes.delete(`${episode.season}:${episode.episode}`);
      }
    }

    if (entry.status) {
      await step(
        `${entry.id}:progress`,
        "progress",
        () =>
          api.post(
            config.progressEndpoint,
            {
              [idKey]: id,
              status: entry.status,
              startedAt: entry.status === "Completed" ? (entry.startedAt ?? null) : null,
              completedAt: entry.status === "Completed" ? (entry.completedAt ?? null) : null,
              ...(entry.contentType === "tv" ? { markAllEpisodes: false } : {}),
            },
            { signal },
          ),
        signal,
        onRetry,
        onResume,
      );
    }

    const watched = [...episodes.values()].map((episode) => ({ ...episode, status: "Completed" }));
    for (let index = 0; index < watched.length; index += EPISODES_PER_REQUEST) {
      await step(
        `${entry.id}:episodes:${index}`,
        "episodes",
        () =>
          api.post(
            apiEndpoints.tvShowEpisodeWatch,
            {
              tvShowId: id,
              episodes: watched.slice(index, index + EPISODES_PER_REQUEST),
            },
            { signal },
          ),
        signal,
        onRetry,
        onResume,
      );
    }

    if (entry.rating !== undefined) {
      await step(
        `${entry.id}:rating`,
        "rating",
        () =>
          upsertReview(
            {
              endpoint: config.reviewEndpoint,
              idKey,
              responseKey: config.reviewResponseKey,
            },
            id,
            userId,
            { overall: entry.rating },
            signal,
            onRetry,
          ).catch((error: unknown) => {
            throw new TraktImportError("rating", responseReason(error));
          }),
        signal,
        onRetry,
        onResume,
      );
    }
  };

  return {
    notFoundKey: "settings:import.errors.notFound",
    warnings: (entry) => warnings.get(entry.id) ?? [],
    errorMessage: (error) => {
      if (!(error instanceof TraktImportError)) return responseReason(error);
      const detail = error.detail && /^[A-Z_]+$/.test(error.detail) ? translate(`api:${error.detail}`) : error.detail;
      const key =
        error.reason === "notFound"
          ? "settings:import.errors.notFound"
          : `settings:import.trakt.errors.${error.reason}`;
      return [translate(key), detail].filter(Boolean).join(" · ");
    },
    importEntry: async (entry, signal, onRetry, onResume) => {
      if (entry.kind === "issue") throw new TraktImportError(entry.reason);
      if (entry.kind === "media") return importMedia(entry, signal, onRetry, onResume);
      const list = await resolveList(entry.list, signal, onRetry, onResume);
      if (list.type !== (entry.list.contentType === "movie" ? "Movie" : "TVShow"))
        throw new TraktImportError("listType");
      if (entry.kind === "list") return;

      const id = await resolveMedia(entry, signal, onRetry, onResume);
      const idKey = mediaIdKey(entry.contentType);
      await step(
        `${entry.id}:item`,
        "listItem",
        async () => {
          const { data } = await api.get<{ listIds: string[] }>(apiEndpoints.getListStatus, {
            params: { type: list.type, [idKey]: id },
            signal,
          });
          if (data.listIds.includes(list.id)) return;

          try {
            await api.post(
              apiEndpoints.listItem(list.id),
              {
                type: list.type,
                listId: list.id,
                [idKey]: id,
                position: entry.position,
              } satisfies ApiTypes.AddItemToListRequest,
              { signal },
            );
          } catch (error) {
            if (!axios.isAxiosError(error) || error.response?.status !== 409) throw error;
            const { data: refreshed } = await api.get<{ listIds: string[] }>(apiEndpoints.getListStatus, {
              params: { type: list.type, [idKey]: id },
              signal,
            });
            if (!refreshed.listIds.includes(list.id)) throw error;
          }
        },
        signal,
        onRetry,
        onResume,
      );
    },
  };
}
