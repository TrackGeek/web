import { Icon } from "@iconify/react";
import { Trans, useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { useMyAnimeListImport } from "@/hooks/use-myanimelist-import";
import { DETAIL_REQUESTS_PER_SECOND } from "@/lib/import/shared";

interface MyAnimeListImportUploadProps {
  provider: "kitsu" | "myanimelist";
  providerName: string;
  importState: ReturnType<typeof useMyAnimeListImport>;
}

export function MyAnimeListImportUpload({ provider, providerName, importState }: MyAnimeListImportUploadProps) {
  const { t } = useTranslation();
  const { fileInputRef, fileName, entries, ignored, isRunning, canStart, handleFileSelect, start, cancel, reset } =
    importState;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon={"lucide:file-code"} className="size-5" />

          {t("settings:import.file.uploadTitle")}
        </CardTitle>

        <CardDescription>
          {t(
            provider === "kitsu"
              ? "settings:import.file.xmlDescription"
              : "settings:import.myanimelist.upload.description",
            { provider: providerName },
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <button
          type="button"
          disabled={isRunning}
          className="flex flex-col justify-center rounded-md border border-dashed border-input px-6 py-8 text-muted-foreground cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileSelect(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon icon={"lucide:file-up"} className="mx-auto size-12" aria-hidden={true} />

          <span className="relative mt-2 text-center text-sm font-medium">
            <Trans
              i18nKey={
                provider === "kitsu"
                  ? "settings:import.file.xmlDropzone"
                  : "settings:import.myanimelist.upload.dropzone"
              }
              values={{ provider: providerName }}
              components={{ span: <span className="text-primary hover:underline" /> }}
            />
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xml,.gz,application/xml,text/xml,application/gzip"
          className="sr-only"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {entries && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary" className="gap-1.5">
                <Icon icon={"lucide:file-code"} className="size-3.5" />
                {fileName}
              </Badge>

              <span className="text-muted-foreground">
                {t("settings:import.file.summary", { count: entries.length })}
              </span>

              {ignored > 0 && (
                <span className="text-muted-foreground">{t("settings:import.ignored", { count: ignored })}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="gap-2" disabled={isRunning || !canStart} onClick={start}>
                <Icon
                  icon={isRunning ? "lucide:loader-circle" : "lucide:play"}
                  className={`size-4 ${isRunning ? "animate-spin" : ""}`}
                />
                {isRunning ? t("settings:import.importing") : t("settings:import.action")}
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
              {t("settings:import.rateNotice", { rate: DETAIL_REQUESTS_PER_SECOND })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
