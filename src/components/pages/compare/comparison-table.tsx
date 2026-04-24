import { ComparisonCell } from "@/components/pages/compare/comparison-cell";
import { PlatformHeader } from "@/components/pages/compare/platform-header";
import {
  type ComparisonCriterion,
  type ComparisonEntry,
  type ComparisonPlatform,
  type ComparisonSupport,
} from "@/lib/comparison.config";

interface ComparisonTableProps {
  criteria: ComparisonCriterion[];
  platforms: ComparisonPlatform[];
  entries: ComparisonEntry[];
}

function getSupport(
  entries: ComparisonEntry[],
  criterionId: ComparisonCriterion["id"],
  platformId: ComparisonPlatform["id"],
): { support: ComparisonSupport; note?: string } {
  const entry = entries.find((item) => item.criterionId === criterionId && item.platformId === platformId);

  return {
    support: entry?.support ?? "no",
    note: entry?.note,
  };
}

export function ComparisonTable({ criteria, platforms, entries }: ComparisonTableProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card/80 shadow-sm md:block">
        <table className="w-full min-w-[950px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 border-b border-border bg-card px-4 py-4 text-left text-sm font-semibold text-foreground">
                Features
              </th>
              {platforms.map((platform) => (
                <th
                  key={platform.id}
                  className={`border-b border-border px-4 py-4 text-left align-top ${
                    platform.isTrackGeek ? "bg-primary/10" : "bg-card"
                  }`}
                >
                  <PlatformHeader platform={platform} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion, rowIndex) => (
              <tr key={criterion.id} className="border-b border-border/60">
                <td
                  className={`sticky left-0 z-10 w-[280px] border-b border-border px-4 py-4 align-top ${
                    rowIndex % 2 === 0 ? "bg-card" : "bg-muted/20"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{criterion.label}</p>
                  <p className="text-xs text-muted-foreground">{criterion.description}</p>
                </td>
                {platforms.map((platform) => {
                  const status = getSupport(entries, criterion.id, platform.id);

                  return (
                    <td
                      key={`${criterion.id}-${platform.id}`}
                      className={`border-b border-border px-4 py-4 text-center ${
                        platform.isTrackGeek ? "bg-primary/10" : rowIndex % 2 === 0 ? "bg-card" : "bg-muted/20"
                      }`}
                    >
                      <span className="inline-flex items-center justify-center">
                        <ComparisonCell support={status.support} note={status.note} />
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {platforms.map((platform) => (
          <article
            key={platform.id}
            className={`rounded-xl border p-4 shadow-sm ${
              platform.isTrackGeek ? "border-primary/40 bg-primary/10" : "border-border bg-card"
            }`}
          >
            <PlatformHeader platform={platform} />
            <div className="mt-4 grid gap-3">
              {criteria.map((criterion) => {
                const status = getSupport(entries, criterion.id, platform.id);

                return (
                  <div key={`${platform.id}-${criterion.id}`} className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{criterion.label}</p>
                      <p className="text-xs text-muted-foreground">{criterion.description}</p>
                    </div>
                    <span className="pt-0.5">
                      <ComparisonCell support={status.support} note={status.note} />
                    </span>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
