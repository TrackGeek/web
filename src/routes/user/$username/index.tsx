import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserActivityTab } from "@/components/pages/user/tabs/activity";
import { UserFavoritesTab } from "@/components/pages/user/tabs/favorites";
import { UserListsTab } from "@/components/pages/user/tabs/lists";
import { UserOverviewTab } from "@/components/pages/user/tabs/overview";
import { UserReviewsTab } from "@/components/pages/user/tabs/reviews";
import { UserScreenshotsTab } from "@/components/pages/user/tabs/screenshots";
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
  const [activeTab, setActiveTab] = useState("overview");

  const userQuery = useQuery({
    queryKey: ["user", username],
    queryFn: () => getUser(username),
    initialData: loaderUser,
  });

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
        <UserProfileHeader user={userQuery.data} username={username} onUserRefresh={() => userQuery.refetch()} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-2 text-sm justify-between mb-5 w-full">
            <TabsTrigger value="overview">{t("user:overview")}</TabsTrigger>
            <TabsTrigger value="activity">{t("user:activity")}</TabsTrigger>
            <TabsTrigger value="lists">
              {t("user:lists")} ({userQuery.data.counts.lists})
            </TabsTrigger>
            <TabsTrigger value="favorites">
              {t("user:favorites")} ({userQuery.data.counts.favorites})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              {t("user:reviews")} ({userQuery.data.counts.reviews})
            </TabsTrigger>
            <TabsTrigger value="screenshots">{t("user:screenshots")} (0)</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <UserOverviewTab user={userQuery.data} onSeeFavorites={() => setActiveTab("favorites")} />
          </TabsContent>

          <TabsContent value="activity">
            <UserActivityTab />
          </TabsContent>

          <TabsContent value="lists">
            <UserListsTab userId={userQuery.data.id} isOwner={session.data?.user?.id === userQuery.data.id} />
          </TabsContent>

          <TabsContent value="favorites">
            <UserFavoritesTab userId={userQuery.data.id} />
          </TabsContent>

          <TabsContent value="reviews">
            <UserReviewsTab
              userId={userQuery.data.id}
              initialContentType={userQuery.data.latestReviewType ?? undefined}
            />
          </TabsContent>

          <TabsContent value="screenshots">
            <UserScreenshotsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
