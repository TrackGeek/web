import { strToU8, zipSync } from "fflate";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { toCsv } from "@/lib/backup/csv";
import {
  BACKUP_MEDIA,
  BACKUP_VERSION,
  columnsFor,
  EPISODE_CONTENT_TYPES,
  EPISODE_FIELDS,
  episodesPath,
  MANIFEST_PATH,
  mediaIdKey,
  PROGRESS_FIELDS,
  progressPath,
  REVIEW_FIELDS,
  reviewsPath,
  rowFrom,
  SCREENSHOT_FIELDS,
  SCREENSHOTS_PATH,
} from "@/lib/backup/schema";
import { CONTENT_TYPE_SLUGS, type ContentTypeSlug } from "@/lib/content-types";
import { detailLimiter } from "@/lib/import/shared";

const ITEMS_PER_PAGE = 50;

export interface BackupCounts {
  progress: number;
  reviews: number;
  episodes: number;
  screenshots: number;
}

interface MediaRef {
  externalId: string;
  title: string;
}

interface MediaSummary {
  title?: string | null;
  name?: string | null;
  [field: string]: unknown;
}

type BackupRecord = Record<string, unknown>;

async function fetchAllPages<T>(
  url: string,
  params: Record<string, unknown>,
  pick: (data: Record<string, unknown>) => ApiTypes.PaginatedResponse<T> | undefined,
  signal: AbortSignal,
): Promise<T[]> {
  const items: T[] = [];

  for (let page = 1; ; page++) {
    await detailLimiter.acquire(signal);

    const { data } = await api.get<Record<string, unknown>>(url, {
      params: { ...params, page, itemsPerPage: ITEMS_PER_PAGE },
      signal,
    });

    const result = pick(data);

    if (!result || result.items.length === 0) break;

    items.push(...result.items);

    if (result.inPage >= result.pages) break;
  }

  return items;
}

function withMedia(contentType: ContentTypeSlug, record: BackupRecord) {
  const { mediaKey, externalIdField } = BACKUP_MEDIA[contentType];
  const media = record[mediaKey] as MediaSummary | null | undefined;

  if (!media) return null;

  const externalId = media[externalIdField];
  const title = media.title ?? media.name ?? "";

  return {
    mediaId: typeof media.id === "string" ? media.id : null,
    externalId: externalId === null || externalId === undefined ? "" : String(externalId),
    title,
    source: { ...record, title, malId: media.malId },
  };
}

function addCsv(files: Record<string, Uint8Array>, path: string, columns: string[], rows: Record<string, string>[]) {
  if (rows.length === 0) return;

  files[path] = strToU8(toCsv(columns, rows));
}

export async function buildBackup(userId: string, signal: AbortSignal) {
  const files: Record<string, Uint8Array> = {};
  const counts: BackupCounts = { progress: 0, reviews: 0, episodes: 0, screenshots: 0 };

  const mediaRefs = new Map<ContentTypeSlug, Map<string, MediaRef>>();

  const trackMedia = (contentType: ContentTypeSlug, entry: { mediaId: string | null } & MediaRef) => {
    if (!entry.mediaId || !BACKUP_MEDIA[contentType].episodeWatch) return;

    const refs = mediaRefs.get(contentType) ?? new Map<string, MediaRef>();

    refs.set(entry.mediaId, { externalId: entry.externalId, title: entry.title });
    mediaRefs.set(contentType, refs);
  };

  for (const contentType of CONTENT_TYPE_SLUGS) {
    const config = BACKUP_MEDIA[contentType];

    const progresses = await fetchAllPages<BackupRecord>(
      `${config.progressEndpoint}/`,
      { userId },
      (data) => data[config.progressResponseKey] as ApiTypes.PaginatedResponse<BackupRecord> | undefined,
      signal,
    );

    const progressFields = PROGRESS_FIELDS[contentType];
    const progressRows = progresses.flatMap((record) => {
      const entry = withMedia(contentType, record);

      if (!entry) return [];

      trackMedia(contentType, entry);

      return [rowFrom(progressFields, entry.externalId, entry.source)];
    });

    counts.progress += progressRows.length;
    addCsv(files, progressPath(contentType), columnsFor(progressFields), progressRows);

    const reviews = await fetchAllPages<BackupRecord>(
      `${config.reviewEndpoint}/`,
      { userId },
      (data) => data[config.reviewResponseKey] as ApiTypes.PaginatedResponse<BackupRecord> | undefined,
      signal,
    );

    const reviewFields = REVIEW_FIELDS[contentType];
    const reviewRows = reviews.flatMap((record) => {
      const entry = withMedia(contentType, record);

      if (!entry) return [];

      trackMedia(contentType, entry);

      return [rowFrom(reviewFields, entry.externalId, entry.source)];
    });

    counts.reviews += reviewRows.length;
    addCsv(files, reviewsPath(contentType), columnsFor(reviewFields), reviewRows);
  }

  for (const contentType of EPISODE_CONTENT_TYPES) {
    const { episodeWatch } = BACKUP_MEDIA[contentType];
    const refs = mediaRefs.get(contentType);

    if (!episodeWatch || !refs) continue;

    const fields = EPISODE_FIELDS[contentType];
    const idKey = mediaIdKey(contentType);
    const rows: Record<string, string>[] = [];

    for (const [mediaId, ref] of refs) {
      await detailLimiter.acquire(signal);

      const { data } = await api.get<Record<string, unknown>>(episodeWatch.endpoint, {
        params: { userId, [idKey]: mediaId },
        signal,
      });

      const watches = (data[episodeWatch.responseKey] ?? []) as BackupRecord[];

      for (const watch of watches) {
        rows.push(rowFrom(fields, ref.externalId, { ...watch, title: ref.title }));
      }
    }

    counts.episodes += rows.length;
    addCsv(files, episodesPath(contentType), columnsFor(fields), rows);
  }

  const screenshots = await fetchAllPages<BackupRecord>(
    `${apiEndpoints.gameScreenshot}/`,
    { userId },
    (data) => data.screenshots as ApiTypes.PaginatedResponse<BackupRecord> | undefined,
    signal,
  );

  const screenshotRows = screenshots.flatMap((record) => {
    const entry = withMedia("game", record);

    return entry ? [rowFrom(SCREENSHOT_FIELDS, entry.externalId, entry.source)] : [];
  });

  counts.screenshots = screenshotRows.length;
  addCsv(files, SCREENSHOTS_PATH, columnsFor(SCREENSHOT_FIELDS), screenshotRows);

  files[MANIFEST_PATH] = strToU8(
    `${JSON.stringify({ version: BACKUP_VERSION, exportedAt: new Date().toISOString(), counts }, null, 2)}\n`,
  );

  return { zip: zipSync(files, { level: 6 }), counts };
}

export function downloadZip(zip: Uint8Array, fileName: string) {
  const url = URL.createObjectURL(new Blob([zip as unknown as BlobPart], { type: "application/zip" }));
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

export function backupFileName() {
  return `trackgeek-backup-${new Date().toISOString().slice(0, 10)}.zip`;
}
