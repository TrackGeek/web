import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

interface OAuthRequestStateProps {
  error?: boolean;
}

export function OAuthRequestState({ error = false }: OAuthRequestStateProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="py-8" role={error ? "alert" : "status"}>
        {t(error ? "auth:oauth.invalid" : "common:loading")}
      </CardContent>
    </Card>
  );
}
