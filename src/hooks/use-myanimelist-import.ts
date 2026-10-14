import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/client";
import { myanimelistRunner, parseExport, readExportFile } from "@/lib/import/myanimelist";
import { type ImportProgress, runImport } from "@/lib/import/shared";
import type { MalEntry } from "@/types/myanimelist-import";

const MAX_FILE_SIZE = 1024 * 1024 * 20;

export function useMyAnimeListImport(providerName: string) {
  const { t } = useTranslation();

  const userId = useSession()?.data?.user?.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [entries, setEntries] = useState<MalEntry[] | null>(null);
  const [ignored, setIgnored] = useState(0);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  const readFile = async (file: File) => {
    if (abortRef.current) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("settings:import.fileTooLarge"));
      return;
    }

    try {
      const { entries: mapped, ignored: skipped } = parseExport(await readExportFile(file));

      if (mapped.length === 0) {
        toast.error(t("settings:import.file.emptyFile"));
        return;
      }

      setFileName(file.name);
      setEntries(mapped);
      setIgnored(skipped);
      setProgress(null);
    } catch {
      toast.error(t("settings:import.file.invalidFile", { provider: providerName }));
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    const file = files?.[0];

    if (file) void readFile(file);
  };

  const start = async () => {
    if (!entries || !userId || abortRef.current) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setIsRunning(true);

    try {
      const result = await runImport(entries, myanimelistRunner(userId), controller.signal, setProgress);

      if (!controller.signal.aborted) {
        toast.success(t("settings:import.file.finished", { count: result.done }));
      }
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
  };

  const reset = () => {
    setFileName(null);
    setEntries(null);
    setIgnored(0);
    setProgress(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const failed = progress?.items.filter((item) => item.state === "error") ?? [];

  const downloadFailures = () => {
    const lines = [
      `TrackGeek — MyAnimeList import failures (${new Date().toISOString()})`,
      `${failed.length} of ${progress?.total ?? 0} entries failed`,
      "",
      ...failed.map((item) => {
        const entry = entries?.find((entry) => entry.id === item.id);

        return [
          item.name,
          `mal:${entry?.malId ?? item.id}`,
          `status:${item.status}`,
          t(item.errorKey ?? "settings:import.errors.failed"),
          entry?.mediaType === "manga"
            ? `https://myanimelist.net/manga/${entry.malId}`
            : `${window.location.origin}/anime/${entry?.malId ?? item.id}`,
        ].join(" | ");
      }),
    ];

    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
    const link = document.createElement("a");

    link.href = url;
    link.download = "trackgeek-myanimelist-import-failures.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  return {
    fileInputRef,
    fileName,
    entries,
    ignored,
    progress,
    isRunning,
    canStart: Boolean(userId),
    handleFileSelect,
    start,
    cancel,
    reset,
    downloadFailures,
  };
}
