import { Icon } from "@iconify/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useSession } from "@/lib/auth/client";
import {
  DETAIL_REQUESTS_PER_SECOND,
  type ImportProgress,
  type MappedEntry,
  parseExport,
  runImport,
} from "@/lib/import/backloggd";
import { seo } from "@/lib/utils/seo";

const FIREFOX_ADDON_URL = "https://addons.mozilla.org/en-US/firefox/addon/backloggd-plus/";
const GITHUB_URL = "https://github.com/jolacdev/backloggd-plus";

const MAX_FILE_SIZE = 1024 * 1024 * 20;

const CHROMIUM_STEPS = ["extract", "openExtensions", "developerMode", "loadUnpacked"] as const;

export const Route = createFileRoute("/_authenticated/settings_/import/backloggd")({
  head: () => ({
    meta: [...seo({ title: "Import from Backloggd" })],
  }),
  component: BackloggdImportRoute,
});

const STATE_BADGE = {
  pending: { variant: "secondary", icon: "lucide:clock" },
  running: { variant: "warning", icon: "lucide:loader-circle" },
  waiting: { variant: "warning", icon: "lucide:hourglass" },
  done: { variant: "success", icon: "lucide:check" },
  error: { variant: "destructive", icon: "lucide:triangle-alert" },
} as const;

function BackloggdImportRoute() {
  const { t } = useTranslation();

  const userId = useSession()?.data?.user?.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [entries, setEntries] = useState<MappedEntry[] | null>(null);
  const [ignored, setIgnored] = useState(0);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  const readFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("settings:import.backloggd.fileTooLarge"));
      return;
    }

    try {
      const { entries: mapped, ignored: skipped } = parseExport(JSON.parse(await file.text()));

      if (mapped.length === 0) {
        toast.error(t("settings:import.backloggd.emptyFile"));
        return;
      }

      setFileName(file.name);
      setEntries(mapped);
      setIgnored(skipped);
      setProgress(null);
    } catch {
      toast.error(t("settings:import.backloggd.invalidFile"));
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    const file = files?.[0];

    if (file) void readFile(file);
  };

  const start = async () => {
    if (!entries || !userId) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setIsRunning(true);

    try {
      const result = await runImport(entries, userId, controller.signal, setProgress);

      if (!controller.signal.aborted) {
        toast.success(t("settings:import.backloggd.finished", { count: result.done }));
      }
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    setIsRunning(false);
  };

  const reset = () => {
    setFileName(null);
    setEntries(null);
    setIgnored(0);
    setProgress(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handled = progress ? progress.done + progress.failed : 0;
  const percentage = progress && progress.total > 0 ? Math.round((handled / progress.total) * 100) : 0;

  const failed = progress?.items.filter((item) => item.state === "error") ?? [];

  /** Plain text so the user can re-check or re-add the leftovers by hand. */
  const downloadFailures = () => {
    const lines = [
      `TrackGeek — Backloggd import failures (${new Date().toISOString()})`,
      `${failed.length} of ${progress?.total ?? 0} entries failed`,
      "",
      ...failed.map((item) =>
        [
          item.name,
          `igdb:${item.igdbId}`,
          `status:${item.status}`,
          t(item.errorKey ?? "settings:import.errors.failed"),
          `${window.location.origin}/game/${item.igdbId}`,
        ].join(" | "),
      ),
    ];

    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
    const link = document.createElement("a");

    link.href = url;
    link.download = "trackgeek-backloggd-import-failures.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <Button asChild variant="ghost" size="sm" className="w-fit gap-2 -ml-2">
        <Link to="/settings">
          <Icon icon={"lucide:arrow-left"} className="size-4" />

          {t("common:settings")}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            <Icon icon={"lucide:book-open-text"} className="size-5" />

            {t("settings:import.backloggd.instructions.title")}
          </CardTitle>

          <CardDescription>{t("settings:import.backloggd.instructions.description")}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/30 p-4">
              <span className="flex items-center gap-2 font-medium">
                <Icon icon={"simple-icons:firefox"} className="size-4" />
                Firefox
              </span>

              <p className="flex-1 text-muted-foreground">{t("settings:import.backloggd.instructions.firefox")}</p>

              <Button asChild size="sm" variant="outline" className="w-fit gap-2">
                <a href={FIREFOX_ADDON_URL} target="_blank" rel="noreferrer">
                  <Icon icon={"lucide:external-link"} className="size-4" />
                  {t("settings:import.backloggd.instructions.firefoxAction")}
                </a>
              </Button>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/30 p-4">
              <span className="flex items-center gap-2 font-medium">
                <Icon icon={"simple-icons:googlechrome"} className="size-4" />
                {t("settings:import.backloggd.instructions.chromium")}
              </span>

              <p className="flex-1 text-muted-foreground">
                {t("settings:import.backloggd.instructions.chromiumDescription")}
              </p>

              <Button asChild size="sm" variant="outline" className="w-fit gap-2">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                  <Icon icon={"simple-icons:github"} className="size-4" />
                  {t("settings:import.backloggd.instructions.chromiumAction")}
                </a>
              </Button>
            </div>
          </div>

          <ol className="flex list-inside list-decimal flex-col gap-1.5 text-muted-foreground">
            {CHROMIUM_STEPS.map((step) => (
              <li key={step}>
                <Trans
                  i18nKey={`settings:import.backloggd.instructions.chromiumSteps.${step}`}
                  components={{ code: <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground" /> }}
                />
              </li>
            ))}
          </ol>

          <p className="rounded-lg border border-border/50 bg-muted/30 p-3 text-muted-foreground">
            <Icon icon={"lucide:shield-check"} className="mr-2 inline size-4 align-text-bottom" />
            {t("settings:import.backloggd.instructions.privacy")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Icon icon={"lucide:file-json"} className="size-5" />

            {t("settings:import.backloggd.upload.title")}
          </CardTitle>

          <CardDescription>{t("settings:import.backloggd.upload.description")}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/** biome-ignore lint/a11y/useSemanticElements: styled drop zone */}
          <div
            role={"button"}
            tabIndex={0}
            className="flex flex-col justify-center rounded-md border border-dashed border-input px-6 py-8 text-muted-foreground cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileSelect(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <Icon icon={"lucide:file-up"} className="mx-auto size-12" aria-hidden={true} />

            <p className="relative mt-2 text-center text-sm font-medium">
              <Trans
                i18nKey={"settings:import.backloggd.upload.dropzone"}
                components={{ span: <span className="text-primary hover:underline" /> }}
              />
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {entries && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary" className="gap-1.5">
                  <Icon icon={"lucide:file-json"} className="size-3.5" />
                  {fileName}
                </Badge>

                <span className="text-muted-foreground">
                  {t("settings:import.backloggd.summary", { count: entries.length })}
                </span>

                {ignored > 0 && (
                  <span className="text-muted-foreground">
                    {t("settings:import.backloggd.ignored", { count: ignored })}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-2" disabled={isRunning || !userId} onClick={start}>
                  <Icon
                    icon={isRunning ? "lucide:loader-circle" : "lucide:play"}
                    className={`size-4 ${isRunning ? "animate-spin" : ""}`}
                  />
                  {isRunning ? t("settings:import.backloggd.importing") : t("settings:import.action")}
                </Button>

                {isRunning ? (
                  <Button size="sm" variant="outline" className="gap-2" onClick={cancel}>
                    <Icon icon={"lucide:x"} className="size-4" />
                    {t("common:cancel")}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="gap-2" onClick={reset}>
                    <Icon icon={"lucide:rotate-ccw"} className="size-4" />
                    {t("common:clear")}
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                <Icon icon={"lucide:info"} className="mr-1.5 inline size-3.5 align-text-bottom" />
                {t("settings:import.backloggd.rateNotice", { rate: DETAIL_REQUESTS_PER_SECOND })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {progress && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Icon icon={"lucide:list-checks"} className="size-5" />

              {t("common:progress")}
            </CardTitle>

            <CardDescription>
              {t("settings:import.backloggd.progress", {
                done: progress.done,
                failed: progress.failed,
                total: progress.total,
              })}
            </CardDescription>

            {failed.length > 0 && (
              <CardAction>
                <Button variant="outline" size="sm" className="gap-2" onClick={downloadFailures}>
                  <Icon icon={"lucide:download"} className="size-4" />

                  {t("settings:import.backloggd.downloadFailures")}
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
              {progress.items.map((item) => {
                const badge = STATE_BADGE[item.state];

                return (
                  <div
                    key={item.igdbId}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{item.name}</span>

                      <span className="text-xs text-muted-foreground">
                        {t(`feed:lists.${item.status.toLowerCase()}`)}
                        {item.errorKey ? ` · ${t(item.errorKey)}` : ""}
                      </span>
                    </div>

                    <Badge variant={badge.variant} className="shrink-0 gap-1.5">
                      <Icon
                        icon={badge.icon}
                        className={`size-3.5 ${item.state === "running" ? "animate-spin" : ""}`}
                      />
                      {t(`settings:import.states.${item.state}`, { attempt: item.attempt })}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!entries && !progress && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon={"lucide:inbox"} className="size-6" />
            </EmptyMedia>

            <EmptyTitle>{t("settings:import.backloggd.empty.title")}</EmptyTitle>

            <EmptyDescription>{t("settings:import.backloggd.empty.description")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
