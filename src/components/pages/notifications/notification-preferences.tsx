import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/notification";
import type { ApiTypes } from "@/lib/api.ts";

const CATEGORIES: { key: keyof ApiTypes.NotificationPreferences; labelKey: string }[] = [
  { key: "comment", labelKey: "notifications:preferences.comment" },
  { key: "reaction", labelKey: "notifications:preferences.reaction" },
];

export function NotificationPreferences() {
  const { t } = useTranslation();

  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const onToggle = (key: keyof ApiTypes.NotificationPreferences, value: boolean) => {
    updatePreferences.mutate({ [key]: value }, { onError: () => toast.error(t("common:somethingWentWrong")) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="lucide:sliders-horizontal" className="size-5" />
          {t("notifications:preferences.title")}
        </CardTitle>
        <CardDescription>{t("notifications:preferences.description")}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {CATEGORIES.map(({ key, labelKey }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <Label htmlFor={`notification-pref-${key}`}>{t(labelKey)}</Label>

            {isLoading || !preferences ? (
              <Skeleton className="h-[1.15rem] w-8 rounded-full" />
            ) : (
              <Switch
                id={`notification-pref-${key}`}
                checked={preferences[key]}
                disabled={updatePreferences.isPending}
                onCheckedChange={(value) => onToggle(key, value)}
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
