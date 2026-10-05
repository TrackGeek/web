import { toCsv } from "@/lib/backup/csv";

function flatten(value: unknown, prefix: string, row: Record<string, string>) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, nested] of Object.entries(value)) flatten(nested, prefix ? `${prefix}.${key}` : key, row);
  } else {
    const text = value == null ? "" : Array.isArray(value) ? JSON.stringify(value) : String(value);
    row[prefix] = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  }
}

export function anilistFailuresCsv(items: Record<string, unknown>[]) {
  const rows = items
    .filter((item) => ["skipped", "unmatched", "failed"].includes(String(item.state)))
    .map((item) => {
      const row: Record<string, string> = {};
      flatten(item, "", row);
      return row;
    });
  const columns = [
    ...new Set(["mediaId", "name", "state", "reason", "warnings", ...rows.flatMap((row) => Object.keys(row))]),
  ];
  return `\uFEFF${toCsv(columns, rows)}`;
}
