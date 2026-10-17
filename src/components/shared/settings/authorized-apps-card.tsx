import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OAUTH_SCOPE_LABELS } from "@/constants/oauth-scopes";
import { useOAuthApps } from "@/hooks/use-oauth-apps";

export function AuthorizedAppsCard() {
  const { t } = useTranslation();
  const { apps, revoke } = useOAuthApps();
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:app-window" aria-hidden="true" />
          {t("settings:oauth.title")}
        </CardTitle>
        <CardDescription>{t("settings:oauth.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {apps.isPending && (
          <p role="status" className="text-sm">
            {t("common:loading")}
          </p>
        )}
        {(apps.isError || revoke.isError) && (
          <p role="alert" className="text-sm text-destructive">
            {t("settings:oauth.failed")}
          </p>
        )}
        {apps.data?.length === 0 && <p className="text-sm text-muted-foreground">{t("settings:oauth.empty")}</p>}
        {apps.data?.map((app) => (
          <div key={app.id} className="flex flex-wrap items-start justify-between gap-3 rounded-md border p-4">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-medium wrap-anywhere">{app.name ?? app.clientId}</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {app.scopes.map((scope) => (
                  <li key={scope}>{t(OAUTH_SCOPE_LABELS[scope] ?? "auth:oauth.unknownScope")}</li>
                ))}
              </ul>
            </div>
            <Button
              variant="outline"
              className="min-h-11"
              disabled={revoke.isPending}
              onClick={() => revoke.mutate(app.clientId)}
            >
              {t("settings:connections.disconnect")}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
