import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { OAuthClientCredentials } from "@/types/oauth";

interface OAuthClientCredentialsProps {
  credentials: OAuthClientCredentials;
  onDismiss: () => void;
}

export function OAuthClientCredentialsNotice({ credentials, onDismiss }: OAuthClientCredentialsProps) {
  const { t } = useTranslation();
  return (
    <div role="status" className="space-y-3 rounded-md border border-primary/40 bg-primary/5 p-4">
      <p className="text-sm">{t("settings:oauth.developer.credentialsHint")}</p>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="font-medium">{t("settings:oauth.developer.clientId")}</dt>
          <dd className="select-all break-all font-mono">{credentials.client_id}</dd>
        </div>
        {credentials.client_secret && (
          <div>
            <dt className="font-medium">{t("settings:oauth.developer.clientSecret")}</dt>
            <dd className="select-all break-all font-mono">{credentials.client_secret}</dd>
          </div>
        )}
      </dl>
      <Button variant="outline" className="min-h-11" onClick={onDismiss}>
        {t("settings:oauth.developer.dismissCredentials")}
      </Button>
    </div>
  );
}
