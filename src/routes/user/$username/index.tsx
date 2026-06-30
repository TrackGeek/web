import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { seo } from "@/lib/utils/seo";
import { api, apiEndpoints, type ApiTypes } from "@/lib/api";
import { ErrorComponent } from "@/components/shared/error";
import { NotFoundComponent } from "@/components/shared/404";
import { useQuery } from "@tanstack/react-query";
import { UserProfileHeader } from "@/components/pages/user/user-profile-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserOverviewTab } from "@/components/pages/user/tabs/overview";
import { UserReviewsTab } from "@/components/pages/user/tabs/reviews";
import { UserFavoritesTab } from "@/components/pages/user/tabs/favorites";
import { UserScreenshotsTab } from "@/components/pages/user/tabs/screenshots";
import { UserActivityTab } from "@/components/pages/user/tabs/activity";
import ViteImage from "@son426/vite-image/react";

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
          <ViteImage
            className="aspect-video w-full object-cover"
            src={{
              src: userQuery.data.profile.bannerUrl,
              blurDataURL: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH",
              width: 1200,
              height: 330,
            }}
          />
        ) : (
          <div className="aspect-video w-full h-82.5" style={{ backgroundColor: userQuery.data.profile.color }} />
        )}
        
        <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
      </div>
      
      <div className="flex flex-col grow py-5 px-4 max-w-7xl w-full flex-1 mx-auto">
        <UserProfileHeader
          user={userQuery.data}
          username={username}
          onUserRefresh={() => userQuery.refetch()}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-2 text-sm justify-between mb-5 w-full">
            <TabsTrigger value="overview">{t("user:overview")}</TabsTrigger>
            <TabsTrigger value="activity">{t("user:activity")}</TabsTrigger>
            <TabsTrigger value="lists">{t("user:lists")}</TabsTrigger>
            <TabsTrigger value="favorites">{t("user:favorites")}</TabsTrigger>
            <TabsTrigger value="reviews">{t("user:reviews")}</TabsTrigger>
            <TabsTrigger value="screenshots">{t("user:screenshots")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <UserOverviewTab user={userQuery.data} onSeeFavorites={() => setActiveTab("favorites")} />
          </TabsContent>

          <TabsContent value="activity">
            <UserActivityTab />
          </TabsContent>
          
          <TabsContent value="lists">
            
          </TabsContent>
          
          <TabsContent value="favorites">
            <UserFavoritesTab userId={userQuery.data.id} />
          </TabsContent>

          <TabsContent value="reviews">
            <UserReviewsTab />
          </TabsContent>

          <TabsContent value="screenshots">
            <UserScreenshotsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
