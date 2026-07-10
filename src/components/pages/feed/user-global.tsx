import { useTranslation } from "react-i18next";
import { globalActivitiesQueryKey, useGlobalActivities, useToggleActivityReaction } from "@/hooks/activity";
import { ActivityFeed } from "./activity-feed";

export function FeedListGlobal() {
  const { t } = useTranslation();
  const query = useGlobalActivities();
  const toggleReaction = useToggleActivityReaction(globalActivitiesQueryKey());

  return (
    <ActivityFeed
      query={query}
      toggleReaction={toggleReaction}
      emptyTitle={t("feed:emptyGlobalTitle")}
      emptyDescription={t("feed:emptyGlobalDescription")}
    />
  );
}
