import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/notification";
import type { ApiTypes } from "@/lib/api.ts";

const CATEGORIES: { key: keyof ApiTypes.NotificationPreferences; labelKey: string; descriptionKey: string }[] = [
  {
    key: "comment",
    labelKey: "notifications:preferences.comment",
    descriptionKey: "notifications:preferences.commentDescription",
  },
  {
    key: "reaction",
    labelKey: "notifications:preferences.reaction",
    descriptionKey: "notifications:preferences.reactionDescription",
  },
  {
    key: "newEpisode",
    labelKey: "notifications:preferences.newEpisode",
    descriptionKey: "notifications:preferences.newEpisodeDescription",
  },
  {
    key: "newChapter",
    labelKey: "notifications:preferences.newChapter",
    descriptionKey: "notifications:preferences.newChapterDescription",
  },
  {
    key: "gameRelease",
    labelKey: "notifications:preferences.gameRelease",
    descriptionKey: "notifications:preferences.gameReleaseDescription",
  },
  {
    key: "sequelAdded",
    labelKey: "notifications:preferences.sequelAdded",
    descriptionKey: "notifications:preferences.sequelAddedDescription",
  },
  {
    key: "reopenedCompleted",
    labelKey: "notifications:preferences.reopenedCompleted",
    descriptionKey: "notifications:preferences.reopenedCompletedDescription",
  },
  {
    key: "levelUp",
    labelKey: "notifications:preferences.levelUp",
    descriptionKey: "notifications:preferences.levelUpDescription",
  },
  {
    key: "mission",
    labelKey: "notifications:preferences.mission",
    descriptionKey: "notifications:preferences.missionDescription",
  },
];

export function SettingsNotificationsTab() {
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
        {CATEGORIES.map(({ key, labelKey, descriptionKey }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5 min-w-0">
              <Label htmlFor={`notification-pref-${key}`}>{t(labelKey)}</Label>
              <p className="text-xs text-muted-foreground">{t(descriptionKey)}</p>
            </div>

            {isLoading || !preferences ? (
              <Skeleton className="h-[1.15rem] w-8 rounded-full shrink-0" />
            ) : (
              <Switch
                id={`notification-pref-${key}`}
                className="shrink-0"
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
