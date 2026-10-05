import { Icon } from "@iconify/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ImportProgressCard } from "@/components/pages/settings/import-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAnilistFailures,
  useAnilistImportStatus,
  useAnilistSnapshot,
  useStartAnilistImport,
} from "@/hooks/anilist-snapshot";
import { useSession } from "@/lib/auth/client";
import { anilistFailuresCsv } from "@/lib/import/anilist-report";
import type { ImportItem, ImportProgress } from "@/lib/import/shared";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/_authenticated/settings_/import/anilist")({
  head: () => ({ meta: [...seo({ title: "AniList snapshot" })] }),
  component: AnilistSnapshotRoute,
});

function AnilistSnapshotRoute() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("Kuriel");
  const controllerRef = useRef<AbortController | null>(null);
  const snapshot = useAnilistSnapshot();
  const startImport = useStartAnilistImport();
  const userId = useSession().data?.user?.id;
  const [jobId, setJobId] = useState<string | null>(null);
  const job = useAnilistImportStatus(jobId);
  const storageKey = userId ? `anilist-import:${userId}` : null;
  const running = Boolean(jobId) && !["completed", "failed"].includes(job.data?.state ?? "");

  useEffect(() => {
    if (storageKey && typeof localStorage !== "undefined") {
      try {
        setJobId(localStorage.getItem(storageKey));
      } catch {
        setJobId(null);
      }
    }
  }, [storageKey]);

  const importSnapshot = () => {
    if (!snapshot.data || running || startImport.isPending) return;
    startImport.mutate(snapshot.data.snapshotId, {
      onSuccess: ({ jobId }) => {
        setJobId(jobId);
        if (storageKey && typeof localStorage !== "undefined") {
          try {
            localStorage.setItem(storageKey, jobId);
          } catch {}
        }
      },
    });
  };

  useEffect(() => () => controllerRef.current?.abort(), []);

  const collect = () => {
    if (!username.trim() || snapshot.isPending || running || startImport.isPending) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    snapshot.reset();
    startImport.reset();
    snapshot.mutate({ username: username.trim(), signal: controller.signal });
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFailures = async () => {
    if (!jobId || isDownloading) return;
    setIsDownloading(true);
    try {
      const csv = anilistFailuresCsv(await getAnilistFailures(jobId));
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `anilist-import-${jobId}-failures.csv`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error(t("settings:export.failed"));
    } finally {
      setIsDownloading(false);
    }
  };

  const translateWarning = (warning: string) => {
    const [key, originalName, ...renamed] = warning.split(":");
    return t(`settings:import.anilist.warnings.${key}`, {
      name: renamed.length ? renamed.join(":") : originalName,
      defaultValue: warning,
    });
  };

  const report = job.data?.report;
  const progress: ImportProgress | null = report
    ? {
        done: report.imported,
        failed: report.failed,
        skipped: report.skipped,
        unmatched: report.unmatched,
        total: report.total,
        items: (() => {
          const results = new Map(report.items.map((item) => [item.mediaId, item]));
          const entries = job.data?.entries ?? report.items;
          return entries.map((entry): ImportItem => {
            const result = results.get(entry.mediaId);
            const state = !result
              ? "pending"
              : result.state === "imported"
                ? "done"
                : result.state === "failed"
                  ? "error"
                  : result.state === "skipped"
                    ? "skipped"
                    : "unmatched";
            return {
              id: String(entry.mediaId),
              name: entry.name,
              status: "status" in entry ? entry.status : undefined,
              state,
              message: result?.reason
                ? t(`settings:import.anilist.reasons.${result.reason}`, {
                    defaultValue: t(`api:${result.reason}`, { defaultValue: t("settings:import.errors.failed") }),
                  })
                : undefined,
              warnings: result?.warnings?.map(translateWarning),
            };
          });
        })(),
      }
    : null;

  const status = isAxiosError(snapshot.error) ? snapshot.error.response?.status : undefined;
  const errorKey = status === 404 ? "notFound" : status === 403 ? "private" : status === 429 ? "rateLimit" : "failed";

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <Button asChild variant="ghost" size="sm" className="w-fit gap-2 -ml-2">
        <Link to="/settings">
          <Icon icon="lucide:arrow-left" className="size-4" />
          {t("common:settings")}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            <Icon icon="simple-icons:anilist" className="size-5" />
            {t("settings:import.anilist.title")}
          </CardTitle>
          <CardDescription>{t("settings:import.anilist.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              collect();
            }}
          >
            <Label htmlFor="anilist-username">{t("settings:profile.username")}</Label>
            <Input
              id="anilist-username"
              value={username}
              required
              maxLength={50}
              disabled={snapshot.isPending || running || startImport.isPending}
              onChange={(event) => setUsername(event.target.value)}
            />
            <Button
              type="submit"
              className="w-fit gap-2"
              disabled={snapshot.isPending || running || startImport.isPending || !username.trim()}
            >
              <Icon
                icon={snapshot.isPending ? "lucide:loader-circle" : "lucide:download"}
                className={`size-4 ${snapshot.isPending ? "animate-spin" : ""}`}
              />
              {t(`settings:import.anilist.${snapshot.isPending ? "collecting" : "collect"}`)}
            </Button>
          </form>
          {snapshot.isError && <p role="alert">{t(`settings:import.anilist.errors.${errorKey}`)}</p>}
          {!jobId && <p className="text-sm text-muted-foreground">{t("settings:import.anilist.noImport")}</p>}
        </CardContent>
      </Card>

      {snapshot.data && (
        <Card>
          <CardHeader>
            <CardTitle>{t("settings:import.anilist.title")}</CardTitle>
            <CardDescription>
              {t("settings:import.anilist.summary", {
                count: snapshot.data.counts.total,
                username: snapshot.data.user.name,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3" aria-live="polite">
            {(["anime", "manga"] as const).map((type) => (
              <p key={type}>
                {t("settings:import.anilist.typeCount", {
                  count: snapshot.data?.counts[type],
                  type: t(`common:types.${type}`),
                })}
              </p>
            ))}
            <p className="text-sm text-muted-foreground">{t("settings:import.anilist.updateNotice")}</p>
            <Button
              onClick={importSnapshot}
              disabled={running || startImport.isPending || jobId === snapshot.data.snapshotId}
              className="w-fit gap-2"
            >
              <Icon
                icon={startImport.isPending ? "lucide:loader-circle" : "lucide:upload"}
                className={`size-4 ${startImport.isPending ? "animate-spin" : ""}`}
              />
              {t("settings:import.action")}
            </Button>
            {startImport.isError && <p role="alert">{t("settings:import.anilist.jobError")}</p>}
          </CardContent>
        </Card>
      )}
      {progress && (
        <ImportProgressCard
          key={jobId}
          progress={progress}
          pageSize={25}
          summary={t("settings:import.anilist.reportSummary", { ...report })}
          onDownloadFailures={() => void downloadFailures()}
          isDownloading={isDownloading}
        />
      )}
      {jobId && !job.data && !job.isError && (
        <p role="status" className="text-sm text-muted-foreground">
          {t("common:loading")}
        </p>
      )}
      {(job.isError || job.data?.state === "failed") && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <p role="alert">{t("settings:import.anilist.jobError")}</p>
            <Button
              variant="outline"
              className="w-fit"
              onClick={() => {
                setJobId(null);
                if (storageKey && typeof localStorage !== "undefined") {
                  try {
                    localStorage.removeItem(storageKey);
                  } catch {}
                }
              }}
            >
              {t("common:clear")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
