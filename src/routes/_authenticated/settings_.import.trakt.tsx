import { Icon } from "@iconify/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ImportProgressCard } from "@/components/pages/settings/import-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useSession } from "@/lib/auth/client";
import { type ImportProgress, type ImportRunner, runImport } from "@/lib/import/shared";
import { traktRunner } from "@/lib/import/trakt";
import { parseTraktExport, type TraktEntry, type TraktExport } from "@/lib/import/trakt-export";
import { mergeTraktProgress, traktFailureCsv } from "@/lib/import/trakt-report";
import { seo } from "@/lib/utils/seo";

const EXPORT_URL = "https://app.trakt.tv/settings/data?mode=media";

const MAX_FILE_SIZE = 1024 * 1024 * 50;

const EXPORT_STEPS = [
  "settings:import.trakt.instructions.steps.openPanel",
  "settings:import.trakt.instructions.steps.download",
  "settings:import.myanimelist.instructions.steps.upload",
] as const;

export const Route = createFileRoute("/_authenticated/settings_/import/trakt")({
  head: () => ({
    meta: [...seo({ title: "Import from Trakt" })],
  }),
  component: TraktImportRoute,
});

function TraktImportRoute() {
  const { t } = useTranslation();
  const userId = useSession()?.data?.user?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const runnerRef = useRef<ImportRunner<TraktEntry> | null>(null);
  const readingRef = useRef(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<TraktExport | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isReading, setIsReading] = useState(false);

  useEffect(
    () => () => {
      if (userId) abortRef.current?.abort();
      runnerRef.current = null;
    },
    [userId],
  );

  const readFile = async (file: File) => {
    if (abortRef.current || readingRef.current) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("settings:import.fileTooLarge"));
      return;
    }

    readingRef.current = true;
    setIsReading(true);

    try {
      const parsed = parseTraktExport(new Uint8Array(await file.arrayBuffer()));
      if (parsed.entries.length === 0) {
        toast.error(t("settings:import.file.emptyFile"));
        return;
      }
      setFileName(file.name);
      setSnapshot(parsed);
      setProgress(null);
      runnerRef.current = null;
    } catch {
      toast.error(t("settings:import.file.invalidFile", { provider: "Trakt" }));
    } finally {
      readingRef.current = false;
      setIsReading(false);
    }
  };

  const failed = progress?.items.filter((item) => item.state === "error") ?? [];

  const start = async (retryFailed = false) => {
    if (!snapshot || !userId || abortRef.current || readingRef.current) return;
    const previous = retryFailed ? progress : null;
    const failedIds = new Set(failed.map((item) => item.id));
    const entries = retryFailed ? snapshot.entries.filter((entry) => failedIds.has(entry.id)) : snapshot.entries;
    if (entries.length === 0) return;

    const controller = new AbortController();
    abortRef.current = controller;
    if (!retryFailed || !runnerRef.current) runnerRef.current = traktRunner(userId, (key, values) => t(key, values));
    const runner = runnerRef.current;
    setIsRunning(true);

    try {
      const result = await runImport(entries, runner, controller.signal, (update) => {
        setProgress(previous ? mergeTraktProgress(previous, update) : update);
      });
      if (!controller.signal.aborted) {
        toast.success(t("settings:import.file.finished", { count: result.done }));
      }
    } finally {
      if (abortRef.current === controller) {
        setIsRunning(false);
        abortRef.current = null;
      }
    }
  };

  const reset = () => {
    if (abortRef.current || readingRef.current) return;
    setFileName(null);
    setSnapshot(null);
    setProgress(null);
    runnerRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadFailures = () => {
    if (!snapshot || !progress) return;
    const csv = traktFailureCsv(snapshot.entries, progress, (key) => t(key));
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "trackgeek-trakt-import-failures.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

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
            <Icon icon="simple-icons:trakt" className="size-5" />
            {t("settings:import.trakt.title")}
          </CardTitle>
          <CardDescription>{t("settings:import.trakt.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <Button asChild size="sm" variant="outline" className="w-fit gap-2">
            <a href={EXPORT_URL} target="_blank" rel="noreferrer">
              <Icon icon="lucide:external-link" className="size-4" />
              {t("settings:import.myanimelist.instructions.action")}
            </a>
          </Button>

          <ol className="flex list-inside list-decimal flex-col gap-1.5 text-muted-foreground">
            {EXPORT_STEPS.map((step) => (
              <li key={step}>
                <Trans
                  i18nKey={step}
                  components={{
                    code: <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground" />,
                    strong: <strong />,
                  }}
                />
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Icon icon="lucide:file-up" className="size-5" />
            {t("settings:import.file.uploadTitle")}
          </CardTitle>
          <CardDescription>{t("settings:import.trakt.upload.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <button
            type="button"
            disabled={isRunning || isReading}
            className="flex flex-col justify-center rounded-md border border-dashed border-input px-6 py-8 text-muted-foreground cursor-pointer disabled:cursor-default disabled:opacity-50"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files[0];
              if (file) void readFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon
              icon={isReading ? "lucide:loader-circle" : "lucide:file-up"}
              className={`mx-auto size-12 ${isReading ? "animate-spin" : ""}`}
              aria-hidden
            />
            <span className="relative mt-2 text-center text-sm font-medium">
              <Trans
                i18nKey="settings:import.trakt.upload.dropzone"
                components={{ span: <span className="text-primary hover:underline" /> }}
              />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/zip,.zip"
            className="sr-only"
            aria-label={t("settings:import.file.uploadTitle")}
            disabled={isRunning || isReading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void readFile(file);
            }}
          />

          {snapshot && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary" className="gap-1.5">
                  <Icon icon="lucide:file-archive" className="size-3.5" />
                  {fileName}
                </Badge>
                <span className="text-muted-foreground">
                  {t("settings:import.file.summary", { count: snapshot.entries.length })}
                </span>
                {snapshot.ignored > 0 && (
                  <span className="text-muted-foreground">
                    {t("settings:import.ignored", { count: snapshot.ignored })}
                  </span>
                )}
              </div>
              {snapshot.countMismatches.map((mismatch) => (
                <p key={mismatch.metric} className="text-sm text-amber-600 dark:text-amber-400" role="status">
                  {t("settings:import.trakt.countMismatch", mismatch)}
                </p>
              ))}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="gap-2"
                  disabled={isRunning || isReading || !userId}
                  onClick={() => void start()}
                >
                  <Icon
                    icon={isRunning ? "lucide:loader-circle" : "lucide:play"}
                    className={`size-4 ${isRunning ? "animate-spin" : ""}`}
                  />
                  {isRunning ? t("settings:import.importing") : t("settings:import.action")}
                </Button>
                {failed.length > 0 && !isRunning && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    disabled={!userId || isReading}
                    onClick={() => void start(true)}
                  >
                    <Icon icon="lucide:rotate-cw" className="size-4" />
                    {t("settings:import.trakt.retryFailures")}
                  </Button>
                )}
                {isRunning ? (
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => abortRef.current?.abort()}>
                    <Icon icon="lucide:x" className="size-4" />
                    {t("common:cancel")}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="gap-2" disabled={isReading} onClick={reset}>
                    <Icon icon="lucide:rotate-ccw" className="size-4" />
                    {t("common:clear")}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                <Icon icon="lucide:info" className="mr-1.5 inline size-3.5 align-text-bottom" />
                {t("settings:import.rateNotice")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {progress && <ImportProgressCard progress={progress} onDownloadFailures={downloadFailures} />}
      {!snapshot && !progress && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="lucide:inbox" className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t("settings:import.file.emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("settings:import.file.emptyDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
