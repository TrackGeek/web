import { useTranslation } from "react-i18next";
import { followingActivitiesQueryKey, useFollowingActivities, useToggleActivityReaction } from "@/hooks/activity";
import { ActivityFeed } from "./activity-feed";

interface FeedListFollowingProps {
  enabled?: boolean;
}

export function FeedListFollowing({ enabled = true }: FeedListFollowingProps) {
  const { t } = useTranslation();
  const query = useFollowingActivities(enabled);
  const toggleReaction = useToggleActivityReaction(followingActivitiesQueryKey());

  return (
    <ActivityFeed
      query={query}
      toggleReaction={toggleReaction}
      emptyTitle={t("feed:emptyTitle")}
      emptyDescription={t("feed:emptyFollowingDescription")}
    />
  );
}
