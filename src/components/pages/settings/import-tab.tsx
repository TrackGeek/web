import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportProvider {
  id: string;
  icon: string;
  to: string;
}

const PROVIDERS: ImportProvider[] = [
  { id: "backloggd", icon: "lucide:gamepad-2", to: "/settings/import/backloggd" },
  { id: "myanimelist_anime", icon: "thesvg-color:myanimelist", to: "/settings/import/myanimelist" },
];

export function SettingsImportTab() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon icon={"lucide:download"} className="size-5" />

            {t("settings:import.title")}
          </CardTitle>

          <CardDescription>{t("settings:import.description")}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <Icon icon={provider.icon} className="size-8 shrink-0 text-muted-foreground" />

                <div className="flex flex-col">
                  <span className="font-medium">{t(`settings:import.providers.${provider.id}.name`)}</span>

                  <span className="text-sm text-muted-foreground">
                    {t(`settings:import.providers.${provider.id}.description`)}
                  </span>
                </div>
              </div>

              <Button asChild size="sm" className="gap-2 shrink-0">
                <Link to={provider.to}>
                  <Icon icon={"lucide:upload"} className="size-4" />

                  {t("settings:import.action")}
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
