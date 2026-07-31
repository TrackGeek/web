import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useFollowStatus, useFollowUser, useUnfollowUser } from "@/hooks/follow";
import { useSession } from "@/lib/auth/client";

export interface FollowButtonProps {
  userId: string;
  username: string;
}

export function FollowButton({ userId, username }: FollowButtonProps) {
  const { t } = useTranslation();
  const session = useSession();

  const sessionUser = session.data?.user;

  const followStatusQuery = useFollowStatus(username, userId);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  if (!sessionUser || sessionUser.id === userId) {
    return null;
  }

  const isPending = followUser.isPending || unfollowUser.isPending;

  return followStatusQuery.data?.isFollowing ? (
    <Button variant="outline" size="sm" onClick={() => unfollowUser.mutate(userId)} disabled={isPending}>
      {t("user:unfollow")}
    </Button>
  ) : (
    <Button variant="secondary" size="sm" onClick={() => followUser.mutate(userId)} disabled={isPending}>
      {t("user:follow")}
    </Button>
  );
}
