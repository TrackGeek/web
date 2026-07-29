import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserActivityTab } from "@/components/pages/user/activity-tab";
import { UserFavoritesTab } from "@/components/pages/user/favorites-tab";
import { UserFollowersTab, UserFollowingTab } from "@/components/pages/user/follows-tab";
import { UserListsTab } from "@/components/pages/user/lists-tab";
import { UserOverviewTab } from "@/components/pages/user/overview-tab";
import { UserProgressTab } from "@/components/pages/user/progress-tab";
import { UserReviewsTab } from "@/components/pages/user/reviews-tab";
import { UserScreenshotsTab } from "@/components/pages/user/screenshots-tab";
import { UserProfileHeader } from "@/components/pages/user/user-profile-header";
import { NotFoundComponent } from "@/components/shared/404";
import { ErrorComponent } from "@/components/shared/error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { AVATAR_BLUR } from "@/lib/image";
import { seo } from "@/lib/utils/seo";

async function getUser(username: string) {
  return await api
    .get<ApiTypes.GetUserByUsernameResponse>(apiEndpoints.getUserByUsername(username))
    .then(({ data }) => data.user);
}

export const Route = createFileRoute("/user/$username/")({
  staticData: { layout: "full" },
  beforeLoad: ({ params, search }) => {
    if (!(search as { tab?: string }).tab) {
      throw redirect({ to: "/user/$username", params, search: { tab: "overview" }, replace: true });
    }
  },
  loader: async ({ params }) => {
    try {
      const user = await getUser(params.username);

      return { user };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw notFound();
      }

      throw error;
    }
  },
  head: ({ params }) => ({
    meta: [...seo({ title: `@${params.username}` })],
  }),
  component: UserDetailsRoute,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function UserDetailsRoute() {
  const { username } = Route.useParams();
  const { user: loaderUser } = Route.useLoaderData();
  const { t } = useTranslation();
  const session = useSession();
  const [activeTab, setActiveTab] = useQueryState("tab", { defaultValue: "overview" });
  const [progressType, setProgressType] = useState<ApiTypes.ReviewContentType>(loaderUser.latestProgressType ?? "game");

  const userQuery = useQuery({
    queryKey: ["user", username],
    queryFn: () => getUser(username),
    initialData: loaderUser,
  });

  const { progressStats } = userQuery.data;
  const totalProgress = Object.values(progressStats).reduce((sum, stats) => sum + stats.total, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        {userQuery.data.profile.bannerUrl ? (
          <Image
            className="aspect-video w-full h-82.5 object-cover"
            src={userQuery.data.profile.bannerUrl}
            layout="fullWidth"
            background={AVATAR_BLUR}
            alt=""
          />
        ) : (
          <div className="aspect-video w-full h-82.5" style={{ backgroundColor: userQuery.data.profile.color }} />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="flex flex-col gap-5 grow py-5 px-4 max-w-7xl w-full flex-1 mx-auto">
        <UserProfileHeader
          user={userQuery.data}
          username={username}
          onUserRefresh={() => userQuery.refetch()}
          onActiveTabChange={setActiveTab}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full gap-2 text-sm justify-start overflow-x-auto mb-5">
            <TabsTrigger value="overview">{t("user:overview")}</TabsTrigger>

            <TabsTrigger value="activity">{t("user:activity")}</TabsTrigger>

            <TabsTrigger value="progress">
              {t("common:progress")} ({totalProgress})
            </TabsTrigger>

            <TabsTrigger value="reviews">
              {t("user:reviews")} ({userQuery.data.counts.reviews})
            </TabsTrigger>

            <TabsTrigger value="lists">
              {t("user:lists")} ({userQuery.data.counts.lists})
            </TabsTrigger>

            <TabsTrigger value="favorites">
              {t("user:favorites")} ({userQuery.data.counts.favorites})
            </TabsTrigger>

            <TabsTrigger value="screenshots">
              {t("common:screenshots")} ({userQuery.data.counts.screenshots})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <UserOverviewTab
              user={userQuery.data}
              onSeeFavorites={() => setActiveTab("favorites")}
              onSeeProgress={(nextContentType) => {
                setProgressType(nextContentType);
                setActiveTab("progress");
              }}
            />
          </TabsContent>

          <TabsContent value="activity">
            <UserActivityTab userId={userQuery.data.id} />
          </TabsContent>

          <TabsContent value="progress">
            <UserProgressTab
              userId={userQuery.data.id}
              progressStats={progressStats}
              contentType={progressType}
              onContentTypeChange={setProgressType}
            />
          </TabsContent>

          <TabsContent value="lists">
            <UserListsTab userId={userQuery.data.id} isOwner={session.data?.user?.id === userQuery.data.id} />
          </TabsContent>

          <TabsContent value="favorites">
            <UserFavoritesTab
              userId={userQuery.data.id}
              initialContentType={userQuery.data.latestFavoriteType ?? undefined}
            />
          </TabsContent>

          <TabsContent value="reviews">
            <UserReviewsTab
              userId={userQuery.data.id}
              initialContentType={userQuery.data.latestReviewType ?? undefined}
            />
          </TabsContent>

          <TabsContent value="screenshots">
            <UserScreenshotsTab userId={userQuery.data.id} />
          </TabsContent>

          <TabsContent value="followers">
            <UserFollowersTab userId={userQuery.data.id} />
          </TabsContent>

          <TabsContent value="following">
            <UserFollowingTab userId={userQuery.data.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
