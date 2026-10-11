import { strFromU8, unzipSync } from "fflate";
import z from "zod";
import type { ImportEntry } from "@/lib/import/shared";

const mediaSchema = z.object({
  title: z.string(),
  ids: z.object({ tmdb: z.number().int().positive().nullish(), trakt: z.number().int().positive().nullish() }),
  aired_episodes: z.number().int().nonnegative().nullish(),
});

const itemSchema = z.object({
  type: z.string(),
  movie: mediaSchema.optional(),
  show: mediaSchema.optional(),
  season: z.object({ number: z.number().int().positive() }).optional(),
  episode: z.object({ season: z.number().int().nonnegative(), number: z.number().int().positive() }).optional(),
  watched_at: z.string().optional(),
  rating: z.number().int().min(1).max(10).optional(),
});

const watchedSchema = z.object({
  movie: mediaSchema.optional(),
  show: mediaSchema.optional(),
  plays: z.number().int().nonnegative(),
  last_watched_at: z.string().optional(),
});

const listSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullish(),
  ids: z.object({ trakt: z.number().int().positive() }),
});

export type TraktContentType = "movie" | "tv";

export interface TraktEpisode {
  season: number;
  episode: number;
}

export interface TraktMediaEntry extends ImportEntry {
  kind: "media";
  contentType: TraktContentType;
  tmdbId: string;
  status?: "Planning" | "Watching" | "Completed";
  rating?: number;
  episodes: TraktEpisode[];
  plannedSeasons: number[];
  startedAt?: string;
  completedAt?: string;
}

export interface TraktList {
  id: string;
  name: string;
  description: string | null;
  contentType: TraktContentType;
}

export interface TraktListEntry extends ImportEntry {
  kind: "list";
  list: TraktList;
}

export interface TraktListItemEntry extends ImportEntry {
  kind: "listItem";
  list: TraktList;
  contentType: TraktContentType;
  tmdbId: string;
  position: number;
}

export type TraktIssueReason =
  | "invalidEntry"
  | "missingTmdbId"
  | "missingList"
  | "missingListFile"
  | "unsupportedType"
  | "pendingFormat";

export interface TraktIssueEntry extends ImportEntry {
  kind: "issue";
  reason: TraktIssueReason;
}

export type TraktEntry = TraktMediaEntry | TraktListEntry | TraktListItemEntry | TraktIssueEntry;

export interface TraktExport {
  entries: TraktEntry[];
  ignored: number;
  countMismatches: { metric: string; expected: number; actual: number }[];
}

interface MediaDraft extends TraktMediaEntry {
  airedEpisodes?: number;
  watchedPlays?: number;
  watched: boolean;
  watchedDates: string[];
  lastWatchedAt?: string;
}

type TraktMedia = z.infer<typeof mediaSchema>;

function knownDate(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  const iso = date.toISOString();
  return iso.startsWith("1970-01-01") ? undefined : iso;
}

export function parseTraktExport(bytes: Uint8Array): TraktExport {
  const files = new Map<string, unknown>();

  for (const [path, content] of Object.entries(unzipSync(bytes))) {
    const name = path.split("/").at(-1) ?? path;

    if (!name.endsWith(".json") || path.startsWith("__MACOSX/")) continue;
    if (files.has(name)) throw new Error(`Duplicate export file: ${name}`);

    files.set(name, JSON.parse(strFromU8(content)));
  }

  const supported =
    /^(?:watched-(?:movies|shows)|watched-history-\d+|ratings-(?:movies|shows)|lists-(?:watchlist|lists|list-\d+-.+))\.json$/;

  if (![...files.keys()].some((name) => supported.test(name))) throw new Error("No Trakt export files found");

  const drafts = new Map<string, MediaDraft>();
  const issues: TraktIssueEntry[] = [];
  const listEntries: (TraktListEntry | TraktListItemEntry)[] = [];
  let ignored = 0;

  const issue = (file: string, index: number, reason: TraktIssueReason, name?: string) => {
    issues.push({ id: `issue:${file}:${index}`, kind: "issue", name: name ?? `${file} [${index + 1}]`, reason });
  };

  const rows = (file: string): unknown[] => {
    const value = files.get(file);

    if (value === undefined) return [];
    if (Array.isArray(value)) return value;

    issue(file, -1, "invalidEntry");
    return [];
  };

  const getDraft = (media: TraktMedia, contentType: TraktContentType, file: string, index: number) => {
    if (!media.ids.tmdb) {
      issue(file, index, "missingTmdbId", media.title);
      return null;
    }

    const id = `${contentType}:${media.ids.tmdb}`;
    let draft = drafts.get(id);

    if (!draft) {
      draft = {
        id,
        kind: "media",
        name: media.title,
        contentType,
        tmdbId: String(media.ids.tmdb),
        episodes: [],
        plannedSeasons: [],
        watchedDates: [],
        watched: false,
      };
      drafts.set(id, draft);
    }

    if (media.aired_episodes != null) draft.airedEpisodes = media.aired_episodes;

    return draft;
  };

  const forItems = (file: string, apply: (item: z.infer<typeof itemSchema>, index: number) => void) => {
    rows(file).forEach((row, index) => {
      const parsed = itemSchema.safeParse(row);

      if (!parsed.success) {
        issue(file, index, "invalidEntry");
        return;
      }

      apply(parsed.data, index);
    });
  };

  for (const [file, contentType] of [
    ["watched-movies.json", "movie"],
    ["watched-shows.json", "tv"],
  ] as const) {
    rows(file).forEach((row, index) => {
      const parsed = watchedSchema.safeParse(row);
      const media = parsed.success ? parsed.data[contentType === "movie" ? "movie" : "show"] : undefined;

      if (!parsed.success || !media) {
        issue(file, index, "invalidEntry");
        return;
      }

      const draft = getDraft(media, contentType, file, index);

      if (draft) {
        draft.watched = true;
        draft.watchedPlays = parsed.data.plays;
        draft.lastWatchedAt = parsed.data.last_watched_at;
      }
    });
  }

  const historyFiles = [...files.keys()]
    .filter((name) => /^watched-history-\d+\.json$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]));

  for (const file of historyFiles) {
    forItems(file, (item, index) => {
      const media = item.type === "movie" ? item.movie : item.type === "episode" ? item.show : undefined;

      if (!media || (item.type === "episode" && !item.episode)) {
        issue(file, index, "invalidEntry");
        return;
      }

      const draft = getDraft(media, item.type === "movie" ? "movie" : "tv", file, index);

      if (!draft) return;

      draft.watched = true;
      if (item.watched_at) draft.watchedDates.push(item.watched_at);
      if (item.episode) draft.episodes.push({ season: item.episode.season, episode: item.episode.number });
    });
  }

  forItems("lists-watchlist.json", (item, index) => {
    const media = item.type === "movie" ? item.movie : ["show", "season"].includes(item.type) ? item.show : undefined;

    if (!media || (item.type === "season" && !item.season)) {
      issue("lists-watchlist.json", index, "unsupportedType");
      return;
    }

    const draft = getDraft(media, item.type === "movie" ? "movie" : "tv", "lists-watchlist.json", index);

    if (!draft) return;

    draft.status = item.type === "season" ? "Watching" : (draft.status ?? "Planning");
    if (item.season) draft.plannedSeasons.push(item.season.number);
  });

  for (const [file, contentType] of [
    ["ratings-movies.json", "movie"],
    ["ratings-shows.json", "tv"],
  ] as const) {
    forItems(file, (item, index) => {
      const media = item[contentType === "movie" ? "movie" : "show"];

      if (!media || item.rating === undefined) {
        issue(file, index, "invalidEntry");
        return;
      }

      const draft = getDraft(media, contentType, file, index);
      if (draft) draft.rating = item.rating / 2;
    });
  }

  const lists = new Map<number, z.infer<typeof listSchema>>();

  rows("lists-lists.json").forEach((row, index) => {
    const parsed = listSchema.safeParse(row);
    if (parsed.success) lists.set(parsed.data.ids.trakt, parsed.data);
    else issue("lists-lists.json", index, "invalidEntry");
  });

  for (const [id, metadata] of lists) {
    if (![...files.keys()].some((file) => file.startsWith(`lists-list-${id}-`))) {
      issue("lists-lists.json", id, "missingListFile", metadata.name);
    }
  }

  for (const file of files.keys()) {
    const match = /^lists-list-(\d+)-.+\.json$/.exec(file);
    if (!match) continue;

    const metadata = lists.get(Number(match[1]));
    const items: { media: TraktMedia; contentType: TraktContentType; index: number }[] = [];

    forItems(file, (item, index) => {
      const media = item.type === "movie" ? item.movie : item.type === "show" ? item.show : undefined;

      if (!metadata || !media) {
        issue(file, index, metadata ? "unsupportedType" : "missingList", media?.title);
        return;
      }

      if (!media.ids.tmdb) {
        issue(file, index, "missingTmdbId", media.title);
        return;
      }

      items.push({ media, contentType: item.type === "movie" ? "movie" : "tv", index });
    });

    if (!metadata) continue;

    const types = [...new Set(items.map(({ contentType }) => contentType))];

    for (const contentType of types) {
      const list: TraktList = {
        id: `${metadata.ids.trakt}:${contentType}`,
        name:
          types.length > 1 ? `${metadata.name} (${contentType === "movie" ? "Movies" : "TV Shows"})` : metadata.name,
        description: metadata.description ?? null,
        contentType,
      };
      listEntries.push({ id: `list:${list.id}`, kind: "list", name: list.name, list });

      const seen = new Set<number>();

      for (const { media, index } of items.filter((item) => item.contentType === contentType)) {
        const tmdbId = media.ids.tmdb;
        if (!tmdbId || seen.has(tmdbId)) continue;
        seen.add(tmdbId);
        listEntries.push({
          id: `listItem:${list.id}:${media.ids.tmdb}`,
          kind: "listItem",
          name: `${list.name} · ${media.title}`,
          list,
          contentType,
          tmdbId: String(media.ids.tmdb),
          position: index + 1,
        });
      }
    }
  }

  for (const [file, value] of files) {
    if (/^(?:comments|notes)-/.test(file) && Array.isArray(value) && value.length > 0) {
      value.forEach((_, index) => {
        issue(file, index, "pendingFormat");
      });
    } else if (/^ratings-(?:seasons|episodes)\.json$/.test(file) && Array.isArray(value)) {
      ignored += value.length;
    }
  }

  const entries: TraktEntry[] = [];

  for (const { airedEpisodes, watchedPlays, watched, watchedDates, lastWatchedAt, ...draft } of drafts.values()) {
    draft.episodes = [
      ...new Map(draft.episodes.map((episode) => [`${episode.season}:${episode.episode}`, episode])).values(),
    ];
    draft.plannedSeasons = [...new Set(draft.plannedSeasons)];

    if (watched) {
      draft.status =
        draft.contentType === "movie" ||
        (airedEpisodes !== undefined && (draft.episodes.length || watchedPlays) === airedEpisodes)
          ? "Completed"
          : "Watching";
    }

    if (draft.plannedSeasons.length > 0) draft.status = "Watching";

    if (draft.status === "Completed") {
      const dates = watchedDates
        .map(knownDate)
        .filter((date) => date !== undefined)
        .sort();
      draft.startedAt = dates[0];
      draft.completedAt = dates.at(-1) ?? knownDate(lastWatchedAt);
    }

    entries.push(draft);
  }

  const countMismatches: TraktExport["countMismatches"] = [];
  const stats = files.get("user-stats.json");
  const expectedSchema = z.object({
    movies: z.object({ watched: z.number() }),
    shows: z.object({ watched: z.number() }),
    episodes: z.object({ watched: z.number() }),
    ratings: z.object({ total: z.number() }).optional(),
  });
  const parsedStats = expectedSchema.safeParse(stats);

  if (parsedStats.success) {
    for (const [metric, actual] of [
      ["movies", [...drafts.values()].filter((draft) => draft.watched && draft.contentType === "movie").length],
      ["shows", [...drafts.values()].filter((draft) => draft.watched && draft.contentType === "tv").length],
      ["episodes", entries.reduce((count, entry) => count + (entry.kind === "media" ? entry.episodes.length : 0), 0)],
    ] as const) {
      const expected = parsedStats.data[metric].watched;
      if (expected !== actual) countMismatches.push({ metric, expected, actual });
    }

    const expected = parsedStats.data.ratings?.total;
    const actual = ["movies", "shows", "seasons", "episodes"].reduce((count, type) => {
      const ratings = files.get(`ratings-${type}.json`);
      return count + (Array.isArray(ratings) ? ratings.length : 0);
    }, 0);

    if (expected !== undefined && expected !== actual) countMismatches.push({ metric: "ratings", expected, actual });
  }

  return { entries: [...entries, ...listEntries, ...issues], ignored, countMismatches };
}
