import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOAuthClients } from "@/hooks/use-oauth-clients";
import { OAuthClientCredentialsNotice } from "./oauth-client-credentials";
import { OAuthClientForm } from "./oauth-client-form";
import { OAuthClientRow } from "./oauth-client-row";

export function DeveloperAppsCard() {
  const { t } = useTranslation();
  const { clients, create, remove, credentials, clearCredentials } = useOAuthClients();
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:code" aria-hidden="true" />
          {t("settings:oauth.developer.title")}
        </CardTitle>
        <CardDescription>{t("settings:oauth.developer.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {(clients.isError || create.isError || remove.isError) && (
          <p role="alert" className="text-sm text-destructive">
            {t("settings:oauth.failed")}
          </p>
        )}
        {credentials && <OAuthClientCredentialsNotice credentials={credentials} onDismiss={clearCredentials} />}
        {clients.isPending && (
          <p role="status" className="text-sm">
            {t("common:loading")}
          </p>
        )}
        {clients.data?.map((client) => (
          <OAuthClientRow
            key={client.client_id}
            clientId={client.client_id}
            name={client.client_name ?? client.client_id}
            pending={remove.isPending}
            onRemove={() => remove.mutate(client.client_id)}
          />
        ))}
        <OAuthClientForm pending={create.isPending} onSubmit={create.mutateAsync} />
      </CardContent>
    </Card>
  );
}
