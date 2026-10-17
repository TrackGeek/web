import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OAUTH_DEVELOPER_SCOPES, OAUTH_SCOPE_LABELS } from "@/constants/oauth-scopes";
import type { NewOAuthClient } from "@/types/oauth";

interface OAuthClientFormProps {
  pending: boolean;
  onSubmit: (input: NewOAuthClient) => Promise<unknown>;
}

export function OAuthClientForm({ pending, onSubmit }: OAuthClientFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [redirectUris, setRedirectUris] = useState("");
  const [confidential, setConfidential] = useState(false);
  const [scopes, setScopes] = useState(["profile:read", "library:read"]);
  const [invalidRedirect, setInvalidRedirect] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const uris = redirectUris
      .split("\n")
      .map((uri) => uri.trim())
      .filter(Boolean);
    const valid =
      uris.length > 0 &&
      uris.every((uri) => {
        if (!URL.canParse(uri)) return false;
        const url = new URL(uri);
        return (
          !url.username &&
          !url.password &&
          !url.hash &&
          (url.protocol === "https:" ||
            (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)))
        );
      });
    setInvalidRedirect(!valid);
    if (!valid) return;
    await onSubmit({ name: name.trim(), redirectUris: uris, confidential, scopes });
    setName("");
    setRedirectUris("");
  }

  return (
    <form
      onSubmit={(event) => {
        void submit(event).catch(() => undefined);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="oauth-client-name">{t("settings:oauth.developer.name")}</Label>
        <Input
          id="oauth-client-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={100}
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="oauth-client-redirects">{t("settings:oauth.developer.redirects")}</Label>
        <Textarea
          id="oauth-client-redirects"
          value={redirectUris}
          onChange={(event) => setRedirectUris(event.target.value)}
          required
          disabled={pending}
          aria-invalid={invalidRedirect}
          aria-describedby="oauth-client-redirect-hint"
        />
        <p
          id="oauth-client-redirect-hint"
          className={`text-sm ${invalidRedirect ? "text-destructive" : "text-muted-foreground"}`}
          role={invalidRedirect ? "alert" : undefined}
        >
          {t("settings:oauth.developer.redirectHint")}
        </p>
      </div>
      <label htmlFor="oauth-client-confidential" className="flex min-h-11 items-center gap-3 text-sm">
        <Checkbox
          id="oauth-client-confidential"
          checked={confidential}
          disabled={pending}
          onCheckedChange={(checked) => setConfidential(checked === true)}
        />
        {t("settings:oauth.developer.confidential")}
      </label>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">{t("settings:oauth.developer.permissions")}</legend>
        {OAUTH_DEVELOPER_SCOPES.map((scope) => (
          <label
            key={scope}
            htmlFor={`oauth-client-scope-${scope}`}
            className="flex min-h-11 items-center gap-3 text-sm"
          >
            <Checkbox
              id={`oauth-client-scope-${scope}`}
              checked={scopes.includes(scope)}
              disabled={pending}
              onCheckedChange={(checked) =>
                setScopes((current) =>
                  checked === true ? [...current, scope] : current.filter((item) => item !== scope),
                )
              }
            />
            {t(OAUTH_SCOPE_LABELS[scope])}
          </label>
        ))}
      </fieldset>
      <Button type="submit" className="min-h-11" disabled={pending || name.trim().length === 0 || scopes.length === 0}>
        {t(pending ? "common:loading" : "settings:oauth.developer.create")}
      </Button>
    </form>
  );
}
