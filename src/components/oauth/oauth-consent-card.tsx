import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { OAUTH_SCOPE_LABELS } from "@/constants/oauth-scopes";

interface OAuthConsentCardProps {
  name: string;
  account: string;
  scopes: string[];
  pending: boolean;
  error: boolean;
  onConsent: (accept: boolean) => void;
}

export function OAuthConsentCard({ name, account, scopes, pending, error, onConsent }: OAuthConsentCardProps) {
  const { t } = useTranslation();
  const knownScopes = scopes.every((scope) => scope in OAUTH_SCOPE_LABELS);
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:shield-check" aria-hidden="true" />
          <h1>{t("auth:oauth.title")}</h1>
        </CardTitle>
        <CardDescription>{t("auth:oauth.request", { name })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm wrap-anywhere">{t("auth:oauth.account", { account })}</p>
        <ul className="space-y-3">
          {scopes.map((scope) => (
            <li key={scope} className="flex items-start gap-3 text-sm">
              <Icon
                icon={scope === "progress:write" ? "lucide:pencil" : "lucide:check"}
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="wrap-anywhere">{t(OAUTH_SCOPE_LABELS[scope] ?? "auth:oauth.unknownScope")}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">{t("auth:oauth.revokeHint")}</p>
        {(error || !knownScopes) && (
          <p role="alert" className="text-sm text-destructive">
            {t("auth:oauth.failed")}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        <Button variant="outline" className="min-h-11 flex-1" disabled={pending} onClick={() => onConsent(false)}>
          {t("auth:oauth.deny")}
        </Button>
        <Button className="min-h-11 flex-1" disabled={pending || !knownScopes} onClick={() => onConsent(true)}>
          {t(pending ? "common:loading" : "auth:oauth.allow")}
        </Button>
      </CardFooter>
    </Card>
  );
}
