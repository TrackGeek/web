import { Icon } from "@iconify/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ImportFileEmpty } from "@/components/pages/settings/import-file-empty";
import { ImportProgressCard } from "@/components/pages/settings/import-progress";
import { MyAnimeListImportInstructions } from "@/components/pages/settings/myanimelist-import-instructions";
import { MyAnimeListImportUpload } from "@/components/pages/settings/myanimelist-import-upload";
import { Button } from "@/components/ui/button";
import { useMyAnimeListImport } from "@/hooks/use-myanimelist-import";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/_authenticated/settings_/import/myanimelist")({
  validateSearch: (search): { instructions?: "kitsu" } => ({
    instructions: search.instructions === "kitsu" ? "kitsu" : undefined,
  }),
  head: () => ({
    meta: [...seo({ title: "Import from MyAnimeList" })],
  }),
  component: MyAnimeListImportRoute,
});

function MyAnimeListImportRoute() {
  const { t } = useTranslation();
  const { instructions } = Route.useSearch();
  const provider = instructions === "kitsu" ? "kitsu" : "myanimelist";
  const providerName = provider === "kitsu" ? "Kitsu" : "MyAnimeList";
  const importState = useMyAnimeListImport(providerName);
  const { entries, progress, downloadFailures } = importState;

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <Button asChild variant="ghost" size="sm" className="w-fit gap-2 -ml-2">
        <Link to="/settings">
          <Icon icon={"lucide:arrow-left"} className="size-4" />
          {t("common:settings")}
        </Link>
      </Button>

      <MyAnimeListImportInstructions provider={provider} />
      <MyAnimeListImportUpload provider={provider} providerName={providerName} importState={importState} />
      {progress && <ImportProgressCard progress={progress} onDownloadFailures={downloadFailures} />}
      {!entries && !progress && <ImportFileEmpty />}
    </div>
  );
}
