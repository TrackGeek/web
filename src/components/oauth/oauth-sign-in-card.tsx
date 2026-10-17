import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { openAuthModal } from "@/lib/auth/modal";

export function OAuthSignInCard() {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:shield-check" aria-hidden="true" />
          <h1>{t("auth:oauth.title")}</h1>
        </CardTitle>
        <CardDescription>{t("auth:oauth.signIn")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="min-h-11 w-full" onClick={() => openAuthModal()}>
          {t("auth:login")}
        </Button>
      </CardContent>
    </Card>
  );
}
