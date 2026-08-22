import { strFromU8, unzipSync } from "fflate";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { fromCsv } from "@/lib/backup/csv";
import {
  BACKUP_MEDIA,
  type BackupField,
  EPISODE_CONTENT_TYPES,
  EPISODE_FIELDS,
  EXTERNAL_ID_COLUMN,
  episodesPath,
  mediaIdKey,
  PROGRESS_FIELDS,
  payloadFrom,
  progressPath,
  REVIEW_FIELDS,
  reviewsPath,
  SCREENSHOT_FIELDS,
  SCREENSHOTS_PATH,
} from "@/lib/backup/schema";
import { CONTENT_TYPE_SLUGS, type ContentTypeSlug } from "@/lib/content-types";
import {
  detailLimiter,
  type ImportEntry,
  type ImportRunner,
  MEDIA_NOT_FOUND,
  type OnRetry,
  upsertReview,
  withRetry,
} from "@/lib/import/shared";

const EXISTING_SCREENSHOTS_PER_PAGE = 50;

const EPISODES_PER_REQUEST = 100;

export interface BackupEntry extends ImportEntry {
  contentType: ContentTypeSlug;
  externalId: string;
  progress?: Record<string, unknown>;
  review?: Record<string, unknown>;
  episodes: Record<string, unknown>[];
  screenshots: Record<string, unknown>[];
}

type ZipFiles = Record<string, Uint8Array>;

function readFile(files: ZipFiles, path: string): string | null {
  const match = Object.entries(files).find(([name]) => name === path || name.endsWith(`/${path}`));

  return match ? strFromU8(match[1]) : null;
}

function readRows(files: ZipFiles, path: string): Record<string, string>[] {
  const content = readFile(files, path);

  return content ? fromCsv(content) : [];
}

interface EntryDraft extends BackupEntry {
  title: string;
}

class EntryIndex {
  readonly drafts = new Map<string, EntryDraft>();

  ignored = 0;

  get(contentType: ContentTypeSlug, row: Record<string, string>): EntryDraft | null {
    const externalId = (row[EXTERNAL_ID_COLUMN] ?? "").trim();

    if (!externalId) {
      this.ignored++;
      return null;
    }

    const key = `${contentType}:${externalId}`;
    const existing = this.drafts.get(key);

    if (existing) {
      if (!existing.title) existing.title = row.title?.trim() ?? "";

      return existing;
    }

    const draft: EntryDraft = {
      id: key,
      name: "",
      title: row.title?.trim() ?? "",
      contentType,
      externalId,
      episodes: [],
      screenshots: [],
    };

    this.drafts.set(key, draft);

    return draft;
  }
}

function collect(
  index: EntryIndex,
  contentType: ContentTypeSlug,
  fields: BackupField[],
  rows: Record<string, string>[],
) {
  return rows.flatMap((row) => {
    const draft = index.get(contentType, row);

    return draft ? [{ draft, payload: payloadFrom(fields, row) }] : [];
  });
}

export function parseBackup(bytes: Uint8Array): { entries: BackupEntry[]; ignored: number } {
  const files = unzipSync(bytes);
  const index = new EntryIndex();

  for (const contentType of CONTENT_TYPE_SLUGS) {
    for (const { draft, payload } of collect(
      index,
      contentType,
      PROGRESS_FIELDS[contentType],
      readRows(files, progressPath(contentType)),
    )) {
      if (!payload.status) {
        index.ignored++;
        continue;
      }

      draft.progress = payload;
      draft.status = payload.status as ApiTypes.ProgressStatus;
    }

    for (const { draft, payload } of collect(
      index,
      contentType,
      REVIEW_FIELDS[contentType],
      readRows(files, reviewsPath(contentType)),
    )) {
      if (payload.overall === undefined) {
        index.ignored++;
        continue;
      }

      draft.review = payload;
    }
  }

  for (const contentType of EPISODE_CONTENT_TYPES) {
    for (const { draft, payload } of collect(
      index,
      contentType,
      EPISODE_FIELDS[contentType],
      readRows(files, episodesPath(contentType)),
    )) {
      if (payload.episode === undefined || !payload.status) {
        index.ignored++;
        continue;
      }

      draft.episodes.push(payload);
    }
  }

  for (const { draft, payload } of collect(index, "game", SCREENSHOT_FIELDS, readRows(files, SCREENSHOTS_PATH))) {
    if (!payload.url) {
      index.ignored++;
      continue;
    }

    draft.screenshots.push(payload);
  }

  const entries: BackupEntry[] = [];

  for (const draft of index.drafts.values()) {
    if (!draft.progress && !draft.review && draft.episodes.length === 0 && draft.screenshots.length === 0) {
      index.ignored++;
      continue;
    }

    const { title, ...entry } = draft;

    entries.push({ ...entry, name: title || draft.externalId });
  }

  return { entries, ignored: index.ignored };
}

async function resolveMediaId(entry: BackupEntry, signal: AbortSignal, onRetry: OnRetry, onResume: () => void) {
  const { detailEndpoint, mediaKey } = BACKUP_MEDIA[entry.contentType];

  return withRetry(
    async () => {
      await detailLimiter.acquire(signal);

      onResume();

      const { data } = await api.get(detailEndpoint(entry.externalId), { signal });

      const id = data?.[mediaKey]?.id;

      if (!id) throw new Error(MEDIA_NOT_FOUND);

      return id as string;
    },
    signal,
    onRetry,
  );
}

async function importEpisodeWatches(
  endpoint: string,
  episodes: Record<string, unknown>[],
  body: Record<string, unknown>,
  signal: AbortSignal,
  onRetry: OnRetry,
) {
  for (let index = 0; index < episodes.length; index += EPISODES_PER_REQUEST) {
    const chunk = episodes.slice(index, index + EPISODES_PER_REQUEST);

    await withRetry(() => api.post(endpoint, { ...body, episodes: chunk }, { signal }), signal, onRetry);
  }
}

async function importScreenshots(
  screenshots: Record<string, unknown>[],
  gameId: string,
  userId: string,
  signal: AbortSignal,
  onRetry: OnRetry,
) {
  const existing = await withRetry(
    () =>
      api
        .get<ApiTypes.GetGameScreenshotsResponse>(`${apiEndpoints.gameScreenshot}/`, {
          params: { userId, gameId, itemsPerPage: EXISTING_SCREENSHOTS_PER_PAGE },
          signal,
        })
        .then(({ data }) => new Set(data.screenshots.items.map(({ url }) => url))),
    signal,
    onRetry,
  );

  for (const screenshot of screenshots) {
    if (existing.has(String(screenshot.url))) continue;

    await withRetry(
      () => api.post(apiEndpoints.gameScreenshot, { ...screenshot, gameId }, { signal }),
      signal,
      onRetry,
    );

    existing.add(String(screenshot.url));
  }
}

async function importEntry(
  entry: BackupEntry,
  userId: string,
  signal: AbortSignal,
  onRetry: OnRetry,
  onResume: () => void,
) {
  const config = BACKUP_MEDIA[entry.contentType];
  const mediaId = await resolveMediaId(entry, signal, onRetry, onResume);
  const idKey = mediaIdKey(entry.contentType);

  if (entry.progress) {
    await withRetry(
      () => api.post(config.progressEndpoint, { ...entry.progress, [idKey]: mediaId }, { signal }),
      signal,
      onRetry,
    );
  }

  if (entry.review) {
    await upsertReview(
      { endpoint: config.reviewEndpoint, idKey, responseKey: config.reviewResponseKey },
      mediaId,
      userId,
      entry.review,
      signal,
      onRetry,
    );
  }

  if (entry.episodes.length > 0 && config.episodeWatch) {
    await importEpisodeWatches(config.episodeWatch.endpoint, entry.episodes, { [idKey]: mediaId }, signal, onRetry);
  }

  if (entry.screenshots.length > 0) {
    await importScreenshots(entry.screenshots, mediaId, userId, signal, onRetry);
  }
}

export function trackgeekRunner(userId: string): ImportRunner<BackupEntry> {
  return {
    importEntry: (entry, signal, onRetry, onResume) => importEntry(entry, userId, signal, onRetry, onResume),
    notFoundKey: "settings:import.errors.notFound",
  };
}
