import { useTranslation } from "react-i18next";
import { userActivitiesQueryKey, useToggleActivityReaction, useUserActivities } from "@/hooks/activity";
import { ActivityFeed } from "./activity-feed";

interface UserActivityProps {
  userId: string;
}

export function UserActivity({ userId }: UserActivityProps) {
  const { t } = useTranslation();
  const query = useUserActivities(userId);
  const toggleReaction = useToggleActivityReaction(userActivitiesQueryKey(userId));

  return (
    <ActivityFeed
      query={query}
      toggleReaction={toggleReaction}
      emptyTitle={t("user:noActivity")}
      emptyDescription={t("user:noActivityDescription")}
    />
  );
}
