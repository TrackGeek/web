import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
import { api, apiEndpoints, type ApiTypes } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import ViteImage from "@son426/vite-image/react";
import { getInitialsFromName } from '@/lib/utils';

export interface UserProfileHeaderProps {
  user: ApiTypes.User;
  username: string;
  onUserRefresh: () => void;
}

export function UserProfileHeader({ user, username, onUserRefresh }: UserProfileHeaderProps) {
  const { t } = useTranslation();
  const session = useSession();

  const sessionUser = session.data?.user;
  const isOwnProfile = sessionUser?.id === user.id;

  const followStatusQuery = useQuery({
    queryKey: ["follow-status", username],
    queryFn: () =>
      api
        .get<ApiTypes.GetFollowStatusResponse>(apiEndpoints.getFollowStatus(username))
        .then(({ data }) => data.followStatus),
    enabled: Boolean(sessionUser) && !isOwnProfile,
  });

  const followUserMutation = useMutation({
    mutationFn: async (followId: string) => api.post(apiEndpoints.followUser(followId)),
    onSuccess: async () => {
      await Promise.all([onUserRefresh(), followStatusQuery.refetch()]);

      toast.success(t("settings:save.success"));
    },
    onError: () => {
      toast.error(t("settings:save.error"));
    },
  });

  const unfollowUserMutation = useMutation({
    mutationFn: async (unfollowId: string) => api.post(apiEndpoints.unfollowUser(unfollowId)),
    onSuccess: async () => {
      await Promise.all([onUserRefresh(), followStatusQuery.refetch()]);

      toast.success(t("settings:save.success"));
    },
    onError: () => {
      toast.error(t("settings:save.error"));
    },
  });

  return (
    <div className="relative -mt-30 mb-4 flex items-center gap-6 w-full flex-col lg:flex-row">
      <Avatar className="border border-border size-40 cursor-pointer">
        {user.profile.avatarUrl ? (
          <ViteImage
            className="aspect-square size-full"
            src={{
              src: user.profile.avatarUrl,
              blurDataURL: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH",
              width: 160,
              height: 160,
            }}
          />
        ) : (
          <AvatarFallback>{getInitialsFromName(user.name ?? '')}</AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex justify-between gap-4 w-full flex-col items-start lg:flex-row lg:items-center">
        <div className="flex flex-col items-start gap-1">
          <span className="text-3xl font-bold text-card-foreground">{user.name}</span>
          
          <div className="flex items-center gap-2">
            <button
              className="text-md text-accent-foreground block cursor-pointer hover:underline"
              onClick={() => {
                navigator.clipboard.writeText(`${user.username}`);
                toast.success(t("user:copyProfileUsernameSuccess"));
              }}
            >
              @{user.username}
            </button>
            
            {followStatusQuery.data?.followsYou && (
              <span className="bg-muted px-2 py-0.5 rounded-full text-xs text-muted-foreground">
                {t("user:followsYou")}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("common:joinedAt")} {new Date(user.createdAt).toLocaleDateString()}
            </span>
            
            {user.tierStartedAt && (
              <>
                <span className="text-sm text-muted-foreground">
                  •
                </span>
                
                <span className="text-sm text-muted-foreground">
                  {t("common:tierStartedAt")} {new Date(user.tierStartedAt).toLocaleDateString()}
                </span>
                
                <span className="text-sm text-muted-foreground">
                  •
                </span>
                
                <span className="text-sm text-muted-foreground">
                  {t(`common:tiers.${user.tier}`)}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="bg-muted px-3 py-1 rounded-full text-sm">
                <strong className="font-semibold text-card-foreground">{user.userMedals.length}</strong>
                <span className="text-muted-foreground ml-2">{t("user:medals")}</span>
              </div>
              <div className="bg-muted px-3 py-1 rounded-full text-sm">
                <strong className="font-semibold text-card-foreground">{user._count.followers || 0}</strong>
                <span className="text-muted-foreground ml-2">{t("user:follower_plural")}</span>
              </div>
              <div className="bg-muted px-3 py-1 rounded-full text-sm">
                <strong className="font-semibold text-card-foreground">{user._count.following || 0}</strong>
                <span className="text-muted-foreground ml-2">{t("user:following")}</span>
              </div>
            </div>
          </div>

          {session.data?.user && session.data?.user.id !== user.id && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {followStatusQuery.data?.isFollowing ? (
                  <Button
                    variant="outline"
                    onClick={() => unfollowUserMutation.mutate(user.id)}
                    disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
                  >
                    {t("user:unfollow")}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => followUserMutation.mutate(user.id)}
                    disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
                  >
                    {t("user:follow")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
