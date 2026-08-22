import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Markdown } from "@/components/shared/comments/markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AboutCardProps {
  about: string;
}

export function AboutCard({ about }: AboutCardProps) {
  const { t } = useTranslation();

  if (!about?.trim()) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:info" className="size-5" />

          {t("user:bio")}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Markdown className="text-muted-foreground">{about}</Markdown>
      </CardContent>
    </Card>
  );
}
