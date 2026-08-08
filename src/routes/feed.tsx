import { createFileRoute } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { useTranslation } from "react-i18next";
import { FeedListFollowing } from "@/components/pages/feed/user-following";
import { FeedListGlobal } from "@/components/pages/feed/user-global";
import { StillReading, StillWatching } from "@/components/shared/sidebar/still-tracking";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth/client";
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
  const sessionUser = session?.data?.user;

  const [activeTab, setActiveTab] = useQueryState("tab", { defaultValue: isAuthenticated ? "following" : "global" });

  return (
    <div className="flex max-sm:flex-col-reverse gap-5">
      <div className="flex flex-col md:w-2/3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <TabsList className="md:w-2/4">
              {isAuthenticated && <TabsTrigger value="following">{t("common:following")}</TabsTrigger>}
              <TabsTrigger value="global">{t("feed:global")}</TabsTrigger>
            </TabsList>
          </div>

          {isAuthenticated && (
            <TabsContent value="following">
              <FeedListFollowing enabled={activeTab === "following"} />
            </TabsContent>
          )}

          <TabsContent value="global">
            <FeedListGlobal />
          </TabsContent>
        </Tabs>
      </div>

      {sessionUser?.username && (
        <aside className="flex flex-col gap-5 md:w-1/3">
          <StillWatching userId={sessionUser.id} username={sessionUser.username} />
          <StillReading userId={sessionUser.id} username={sessionUser.username} />
        </aside>
      )}
    </div>
  );
}
