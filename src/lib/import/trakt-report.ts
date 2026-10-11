import { toCsv } from "@/lib/backup/csv";
import type { ImportProgress } from "@/lib/import/shared";
import type { TraktEntry } from "@/lib/import/trakt-export";

export function mergeTraktProgress(previous: ImportProgress, update: ImportProgress): ImportProgress {
  const updated = new Map(update.items.map((item) => [item.id, item]));
  const items = previous.items.map((item) => updated.get(item.id) ?? item);

  return {
    items,
    total: items.length,
    done: items.filter((item) => item.state === "done").length,
    failed: items.filter((item) => item.state === "error").length,
  };
}

function spreadsheetValue(value: string): string {
  return /^[\s]*[=+@-]/.test(value) ? `'${value}` : value;
}

export function traktFailureCsv(
  entries: TraktEntry[],
  progress: ImportProgress,
  translate: (key: string) => string,
): string {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const columns = ["name", "kind", "tmdbId", "list", "status", "reason", "warnings"];
  const rows = progress.items
    .filter((item) => item.state === "error")
    .map((item) => {
      const entry = byId.get(item.id);
      const row: Record<string, string> = {
        name: item.name,
        kind: entry?.kind ?? "",
        tmdbId: entry && "tmdbId" in entry ? entry.tmdbId : "",
        list: entry && "list" in entry ? entry.list.name : "",
        status: item.status ?? "",
        reason: item.message || translate(item.errorKey ?? "settings:import.errors.failed"),
        warnings: item.warnings?.join("; ") ?? "",
      };

      return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, spreadsheetValue(value)]));
    });

  return toCsv(columns, rows);
}
