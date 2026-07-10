import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { FeedListFollowing } from "@/components/pages/feed/user-following";
import { StillReading } from "@/components/shared/sidebar/still-reading";
import { StillWatching } from "@/components/shared/sidebar/still-watching";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth.ts";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [...seo({ title: "Feed" })],
  }),
  component: FeedRoute,
});

function FeedRoute() {
  const { t } = useTranslation();

  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  return (
    <div className="flex max-sm:flex-col gap-5">
      <div className="flex flex-col md:w-2/3">
        <Tabs defaultValue={isAuthenticated ? "following" : "global"}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <TabsList className="md:w-2/4">
              {isAuthenticated && <TabsTrigger value="following">{t("feed:following")}</TabsTrigger>}
              <TabsTrigger value="global">{t("feed:global")}</TabsTrigger>
              <TabsTrigger value="trending">{t("feed:trending")}</TabsTrigger>
            </TabsList>
          </div>
          {isAuthenticated && (
            <TabsContent value="following">
              <FeedListFollowing />
            </TabsContent>
          )}
          <TabsContent value="global"></TabsContent>
          <TabsContent value="trending"></TabsContent>
        </Tabs>
      </div>
      <div className="flex flex-col gap-4 md:w-1/3">
        <StillWatching
          items={[
            {
              coverURL: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx177937-Tzgg6rAdhCoH.jpg",
              episode: 3,
              totalEpisodes: 13,
              link: "/",
            },
            {
              coverURL: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/20548.jpg",
              episode: 10,
              totalEpisodes: 51,
              link: "/",
            },
            {
              coverURL: "https://www.themoviedb.org/t/p/w1280/70kTz0OmjjZe7zHvIDrq2iKW7PJ.jpg",
              episode: 96,
              totalEpisodes: 131,
              link: "/",
            },
            {
              coverURL: "https://image.tmdb.org/t/p/w1280/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg",
              episode: 41,
              totalEpisodes: 42,
              link: "/",
            },
          ]}
        />
        <StillReading
          items={[
            {
              coverURL: "https://assets.hardcover.app/editions/30399846/4434002844651.jpg",
              page: 284,
              totalPages: 304,
              link: "/",
            },
            {
              coverURL: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx131640-pkggtmw8VUwa.jpg",
              page: 23,
              totalPages: 131,
              link: "/",
            },
          ]}
        />
      </div>
    </div>
  );
}
