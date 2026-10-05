import { Icon } from "@iconify/react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImportProgress } from "@/lib/import/shared";

const PAGE_SIZE = 1500;

const STATE_BADGE = {
  pending: { variant: "secondary", icon: "lucide:clock" },
  running: { variant: "warning", icon: "lucide:loader-circle" },
  waiting: { variant: "warning", icon: "lucide:hourglass" },
  done: { variant: "success", icon: "lucide:check" },
  error: { variant: "destructive", icon: "lucide:triangle-alert" },
  skipped: { variant: "secondary", icon: "lucide:skip-forward" },
  unmatched: { variant: "warning", icon: "lucide:search-x" },
} as const;

interface ImportProgressCardProps {
  progress: ImportProgress;
  onDownloadFailures: () => void;
  summary?: ReactNode;
  pageSize?: number;
  isDownloading?: boolean;
}

export function ImportProgressCard({
  progress,
  onDownloadFailures,
  summary,
  pageSize = PAGE_SIZE,
  isDownloading = false,
}: ImportProgressCardProps) {
  const { t } = useTranslation();

  const [page, setPage] = useState(0);
  const [pagedTotal, setPagedTotal] = useState(progress.total);

  if (pagedTotal !== progress.total) {
    setPagedTotal(progress.total);
    setPage(0);
  }

  const handled = progress.done + progress.failed + (progress.skipped ?? 0) + (progress.unmatched ?? 0);
  const percentage = progress.total > 0 ? Math.round((handled / progress.total) * 100) : 0;

  const hasFailures = progress.items.some((item) => ["error", "skipped", "unmatched"].includes(item.state));

  const pages = Math.max(1, Math.ceil(progress.items.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = pages > 1 ? progress.items.slice(current * pageSize, (current + 1) * pageSize) : progress.items;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:grid">
        <CardTitle>
          <Icon icon={"lucide:list-checks"} className="size-5" />

          {t("common:progress")}
        </CardTitle>

        <CardDescription>
          {summary ??
            t("settings:import.progress", {
              done: progress.done,
              failed: progress.failed,
              total: progress.total,
            })}
        </CardDescription>

        {hasFailures && (
          <CardAction>
            <Button variant="outline" size="sm" className="gap-2" onClick={onDownloadFailures} disabled={isDownloading}>
              <Icon
                icon={isDownloading ? "lucide:loader-circle" : "lucide:download"}
                className={`size-4 ${isDownloading ? "animate-spin" : ""}`}
              />

              {t("settings:import.downloadFailures")}
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
        </div>

        <div className="flex max-h-96 flex-col gap-1.5 overflow-y-auto pr-1">
          {visible.map((item) => {
            const badge = STATE_BADGE[item.state];

            return (
              <div
                key={item.id}
                className="flex flex-col items-start gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <div className="flex w-full min-w-0 flex-col sm:w-auto">
                  <span className="break-words text-sm font-medium sm:truncate" title={item.name}>
                    {item.name}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {item.status ? t(`feed:lists.${item.status.toLowerCase()}`) : ""}
                    {item.errorKey ? `${item.status ? " · " : ""}${t(item.errorKey)}` : ""}
                    {item.message ? `${item.status ? " · " : ""}${item.message}` : ""}
                  </span>
                  {item.warnings?.map((warning) => (
                    <span key={warning} className="flex items-start gap-1 text-xs text-muted-foreground">
                      <Icon icon="lucide:triangle-alert" className="mt-0.5 size-3 shrink-0 text-amber-500" />
                      {warning}
                    </span>
                  ))}
                </div>

                <Badge variant={badge.variant} className="shrink-0 gap-1.5">
                  <Icon icon={badge.icon} className={`size-3.5 ${item.state === "running" ? "animate-spin" : ""}`} />
                  {t(`settings:import.states.${item.state}`, { attempt: item.attempt })}
                </Badge>
              </div>
            );
          })}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={current === 0}
              aria-label={t("common:previous")}
              onClick={() => setPage(current - 1)}
            >
              <Icon icon={"lucide:chevron-left"} className="size-4" />
            </Button>

            <span className="text-xs text-muted-foreground tabular-nums">
              {current + 1}/{pages}
            </span>

            <Button
              variant="outline"
              size="icon-sm"
              disabled={current === pages - 1}
              aria-label={t("common:next")}
              onClick={() => setPage(current + 1)}
            >
              <Icon icon={"lucide:chevron-right"} className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
