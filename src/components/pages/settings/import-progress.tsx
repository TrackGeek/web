import { Icon } from "@iconify/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImportProgress } from "@/lib/import/shared";

/** Long libraries would otherwise mount thousands of rows at once and stall the tab. */
const PAGE_SIZE = 1500;

const STATE_BADGE = {
  pending: { variant: "secondary", icon: "lucide:clock" },
  running: { variant: "warning", icon: "lucide:loader-circle" },
  waiting: { variant: "warning", icon: "lucide:hourglass" },
  done: { variant: "success", icon: "lucide:check" },
  error: { variant: "destructive", icon: "lucide:triangle-alert" },
} as const;

interface ImportProgressCardProps {
  progress: ImportProgress;
  onDownloadFailures: () => void;
}

export function ImportProgressCard({ progress, onDownloadFailures }: ImportProgressCardProps) {
  const { t } = useTranslation();

  const [page, setPage] = useState(0);
  const [pagedTotal, setPagedTotal] = useState(progress.total);

  if (pagedTotal !== progress.total) {
    setPagedTotal(progress.total);
    setPage(0);
  }

  const handled = progress.done + progress.failed;
  const percentage = progress.total > 0 ? Math.round((handled / progress.total) * 100) : 0;

  const hasFailures = progress.items.some((item) => item.state === "error");

  const pages = Math.max(1, Math.ceil(progress.items.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = pages > 1 ? progress.items.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE) : progress.items;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon={"lucide:list-checks"} className="size-5" />

          {t("common:progress")}
        </CardTitle>

        <CardDescription>
          {t("settings:import.progress", {
            done: progress.done,
            failed: progress.failed,
            total: progress.total,
          })}
        </CardDescription>

        {hasFailures && (
          <CardAction>
            <Button variant="outline" size="sm" className="gap-2" onClick={onDownloadFailures}>
              <Icon icon={"lucide:download"} className="size-4" />

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
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{item.name}</span>

                  <span className="text-xs text-muted-foreground">
                    {item.status ? t(`feed:lists.${item.status.toLowerCase()}`) : ""}
                    {item.errorKey ? `${item.status ? " · " : ""}${t(item.errorKey)}` : ""}
                  </span>
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
