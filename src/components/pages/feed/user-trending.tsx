import { useTranslation } from "react-i18next";
import { trendingActivitiesQueryKey, useToggleActivityReaction, useTrendingActivities } from "@/hooks/activity";
import { ActivityFeed } from "./activity-feed";

interface FeedListTrendingProps {
  enabled?: boolean;
}

export function FeedListTrending({ enabled = true }: FeedListTrendingProps) {
  const { t } = useTranslation();
  const query = useTrendingActivities(enabled);
  const toggleReaction = useToggleActivityReaction(trendingActivitiesQueryKey());

  return (
    <ActivityFeed
      query={query}
      toggleReaction={toggleReaction}
      emptyTitle={t("feed:emptyTrendingTitle")}
      emptyDescription={t("feed:emptyTrendingDescription")}
    />
  );
}
