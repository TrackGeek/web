import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth/client";
import { backupFileName, buildBackup, downloadZip } from "@/lib/backup/export";

export function SettingsExportCard() {
  const { t } = useTranslation();

  const userId = useSession()?.data?.user?.id;

  const abortRef = useRef<AbortController | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  const start = async () => {
    if (!userId) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setIsExporting(true);

    try {
      const { zip, counts } = await buildBackup(userId, controller.signal);
      const total = counts.progress + counts.reviews + counts.episodes + counts.screenshots;

      if (total === 0) {
        toast.error(t("settings:export.empty"));
        return;
      }

      downloadZip(zip, backupFileName());

      toast.success(t("settings:export.finished", { count: total }));
    } catch {
      if (!controller.signal.aborted) toast.error(t("settings:export.failed"));
    } finally {
      setIsExporting(false);
      abortRef.current = null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon={"lucide:hard-drive-download"} className="size-5" />

          {t("settings:export.title")}
        </CardTitle>

        <CardDescription>{t("settings:export.description")}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{t("settings:export.contents")}</p>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-2" disabled={isExporting || !userId} onClick={start}>
            <Icon
              icon={isExporting ? "lucide:loader-circle" : "lucide:download"}
              className={`size-4 ${isExporting ? "animate-spin" : ""}`}
            />

            {isExporting ? t("settings:export.exporting") : t("settings:export.action")}
          </Button>

          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link to="/settings/import/trackgeek">
              <Icon icon={"lucide:upload"} className="size-4" />

              {t("settings:export.importAction")}
            </Link>
          </Button>
        </div>

        {isExporting && (
          <p className="text-xs text-muted-foreground">
            <Icon icon={"lucide:info"} className="mr-1.5 inline size-3.5 align-text-bottom" />
            {t("settings:export.slowNotice")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
