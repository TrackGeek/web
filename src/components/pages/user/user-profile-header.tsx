import { Icon } from "@iconify/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PresenceDot } from "@/components/shared/presence/presence-dot";
import { PresenceLabel } from "@/components/shared/presence/presence-label";
import { ReportDialog } from "@/components/shared/report-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStartChatConversation } from "@/hooks/chat";
import { usePresence, usePresenceSubscription } from "@/hooks/presence";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { AVATAR_FRAME_CLASSES, hasAvatarFrame, isGradientColor } from "@/lib/cosmetics";
import { AVATAR_BLUR } from "@/lib/image";
import { cn, getInitialsFromName } from "@/lib/utils";

export interface UserProfileHeaderProps {
  user: ApiTypes.User;
  username: string;
  onUserRefresh: () => void;
  onActiveTabChange: (tab: string) => void;
}

export function UserProfileHeader({ user, username, onUserRefresh, onActiveTabChange }: UserProfileHeaderProps) {
  const { t, i18n } = useTranslation();
  const session = useSession();
  const navigate = useNavigate();

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

      toast.success(t("user:followed"));
    },
    onError: () => {
      toast.error(t("user:followedError"));
    },
  });

  const unfollowUserMutation = useMutation({
    mutationFn: async (unfollowId: string) => api.post(apiEndpoints.unfollowUser(unfollowId)),
    onSuccess: async () => {
      await Promise.all([onUserRefresh(), followStatusQuery.refetch()]);

      toast.success(t("user:unfollowed"));
    },
    onError: () => {
      toast.error(t("user:unfollowedError"));
    },
  });

  const [reporting, setReporting] = useState(false);

  const presenceUserId = sessionUser ? user.id : undefined;

  usePresenceSubscription([presenceUserId]);

  const { data: presence } = usePresence(presenceUserId);

  const startConversation = useStartChatConversation();

  const canMessage = Boolean(followStatusQuery.data?.isFollowing && followStatusQuery.data?.followsYou);

  const messageButton = (size: "default" | "lg", className?: string) => (
    <>
      {canMessage && (
        <Button
          variant="outline"
          size={size}
          className={className}
          disabled={startConversation.isPending}
          onClick={() =>
            startConversation.mutate(user.id, {
              onSuccess: (conversation) =>
                navigate({ to: "/messages/$conversationId", params: { conversationId: conversation.id } }),
              onError: () => toast.error(t("chat:startError")),
            })
          }
        >
          <Icon icon="lucide:message-circle" className="size-4" />
          {t("chat:message")}
        </Button>
      )}
      <Button
        variant="ghost"
        size={size === "lg" ? "lg" : "icon"}
        aria-label={t("report:targets.User")}
        onClick={() => setReporting(true)}
      >
        <Icon icon="lucide:flag" className="size-4" />
      </Button>
    </>
  );

  return (
    <div className="relative -mt-30 flex items-center gap-6 w-full flex-col lg:flex-row">
      <div className="relative shrink-0">
        <Avatar
          className={cn(
            "size-40 cursor-pointer",
            !hasAvatarFrame(user.profile.avatarFrame) &&
              cn("border border-border", isGradientColor(user.profile.color) && "border-2"),
            AVATAR_FRAME_CLASSES[user.profile.avatarFrame ?? "none"],
          )}
        >
          {user.profile.avatarUrl ? (
            <Image
              className="aspect-square size-full"
              src={user.profile.avatarUrl}
              width={160}
              height={160}
              background={AVATAR_BLUR}
              alt={user.name ?? ""}
            />
          ) : (
            <AvatarFallback className="text-4xl">{getInitialsFromName(user.name ?? "")}</AvatarFallback>
          )}
        </Avatar>
        <PresenceDot presence={presence} className="absolute bottom-3 right-3 size-5 ring-background" />
      </div>

      <div className="flex justify-between gap-4 w-full flex-col items-start lg:flex-row lg:items-center">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-card-foreground">{user.name}</span>

            <Badge variant="secondary" className="gap-1">
              {t("xp:levelShort", { level: user.xp.level })}
            </Badge>

            {user.profile.title && user.profile.title !== "none" && (
              <Badge variant="outline">{t(`cosmetics:titles.${user.profile.title}`)}</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-md text-accent-foreground block cursor-pointer hover:underline"
              onClick={() => {
                navigator.clipboard.writeText(`${user.username}`);
                toast.success(t("user:copyProfileUsernameSuccess"));
              }}
            >
              @{user.username}
            </button>

            <PresenceLabel presence={presence} />

            {followStatusQuery.data?.followsYou && (
              <span className="bg-muted px-2 py-0.5 rounded-full text-xs text-muted-foreground">
                {t("user:followsYou")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("common:joinedAt")} {new Date(user.createdAt).toLocaleDateString(i18n.language)}
            </span>

            {user.tierStartedAt && (
              <>
                <span className="text-sm text-muted-foreground">•</span>

                <span className="text-sm text-muted-foreground">
                  {t("common:tierStartedAt")} {new Date(user.tierStartedAt).toLocaleDateString(i18n.language)}
                </span>

                <span className="text-sm text-muted-foreground">•</span>

                <span className="text-sm text-muted-foreground">{t(`common:tiers.${user.tier}`)}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  await navigate({
                    to: "/user/$username",
                    params: { username: user.username },
                    search: (prev) => ({ ...prev, tab: "overview" }),
                  });

                  requestAnimationFrame(() =>
                    document.getElementById("medals-card")?.scrollIntoView({ behavior: "smooth", block: "start" }),
                  );
                }}
                className="bg-muted px-3 py-1 rounded-full text-sm cursor-pointer"
              >
                <strong className="font-semibold text-card-foreground">{user.userMedals.length}</strong>
                <span className="text-muted-foreground ml-2">{t("user:medals")}</span>
              </button>

              <button
                type="button"
                onClick={() => onActiveTabChange("followers")}
                className="bg-muted px-3 py-1 rounded-full text-sm cursor-pointer"
              >
                <strong className="font-semibold text-card-foreground">{user._count.followers || 0}</strong>
                <span className="text-muted-foreground ml-2">
                  {t("user:follower", { count: user._count.followers || 0 })}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onActiveTabChange("following")}
                className="bg-muted px-3 py-1 rounded-full text-sm cursor-pointer"
              >
                <strong className="font-semibold text-card-foreground">{user._count.following || 0}</strong>
                <span className="text-muted-foreground ml-2">{t("common:following")}</span>
              </button>
            </div>
          </div>

          {session.data?.user && session.data?.user.id !== user.id && (
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2">
                {messageButton("default")}
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
          {session.data?.user && session.data?.user.id === user.id && (
            <div className="hidden lg:flex items-center gap-3">
              <Link to={"/settings"} className="flex items-center gap-2 capitalize">
                <Button variant="outline">{t("user:editProfile")}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {session.data?.user && session.data?.user.id !== user.id && (
        <div className="flex lg:hidden w-full gap-2">
          {messageButton("lg", "flex-1")}
          {followStatusQuery.data?.isFollowing ? (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => unfollowUserMutation.mutate(user.id)}
              disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
            >
              {t("user:unfollow")}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => followUserMutation.mutate(user.id)}
              disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
            >
              {t("user:follow")}
            </Button>
          )}
        </div>
      )}

      {sessionUser && !isOwnProfile && (
        <ReportDialog open={reporting} onOpenChange={setReporting} targetType="User" targetId={user.id} />
      )}
    </div>
  );
}
