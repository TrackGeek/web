import { Icon } from "@iconify/react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const EXPORT_OPTIONS = {
  myanimelist: {
    url: "https://myanimelist.net/panel.php?go=export",
    action: "settings:import.myanimelist.instructions.action",
    steps: ["openPanel", "pickAnime", "download", "upload"],
  },
  kitsu: {
    url: "https://kitsu.app",
    action: "settings:import.kitsu.instructions.action",
    steps: ["openSite", "openSettings", "download", "upload"],
  },
} as const;

interface MyAnimeListImportInstructionsProps {
  provider: keyof typeof EXPORT_OPTIONS;
}

export function MyAnimeListImportInstructions({ provider }: MyAnimeListImportInstructionsProps) {
  const { t } = useTranslation();
  const options = EXPORT_OPTIONS[provider];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:book-open-text" className="size-5" />
          {t("settings:import.myanimelist.instructions.title")}
        </CardTitle>

        <CardDescription>{t(`settings:import.${provider}.instructions.description`)}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 text-sm">
        <Button asChild size="sm" variant="outline" className="w-fit gap-2">
          <a href={options.url} target="_blank" rel="noreferrer">
            <Icon icon="lucide:external-link" className="size-4" />
            {t(options.action)}
          </a>
        </Button>

        <ol className="flex list-inside list-decimal flex-col gap-1.5 text-muted-foreground">
          {options.steps.map((step) => (
            <li key={step}>
              <Trans
                i18nKey={`settings:import.${provider}.instructions.steps.${step}`}
                components={{ code: <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground" /> }}
              />
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
