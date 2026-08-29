import { Icon } from "@iconify/react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { useTranslation } from "react-i18next";
import { FeedListFollowing } from "@/components/pages/feed/user-following";
import { FeedListGlobal } from "@/components/pages/feed/user-global";
import { FeedListTrending } from "@/components/pages/feed/user-trending";
import { StillReading, StillWatching } from "@/components/shared/sidebar/still-tracking";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [...seo({ title: "Feed" })],
  }),
  component: FeedRoute,
});

const contentAnimation = "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 duration-300";

function FeedRoute() {
  const { t } = useTranslation();

  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  const sessionUser = session?.data?.user;
  const hasSidebar = !!sessionUser?.username;

  const [tab, setTab] = useQueryState("tab", { defaultValue: isAuthenticated ? "following" : "global" });

  const activeTab = tab === "following" && !isAuthenticated ? "global" : tab;

  const tabs = [
    ...(isAuthenticated ? [{ value: "following", label: t("common:following"), icon: "lucide:users" }] : []),
    { value: "global", label: t("feed:global"), icon: "lucide:globe" },
    { value: "trending", label: t("feed:trending"), icon: "lucide:flame" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col-reverse gap-5 md:flex-row md:items-start">
        <div className={cn("flex min-w-0 flex-1 flex-col", !hasSidebar && "md:mx-auto md:max-w-3xl")}>
          <Tabs value={activeTab} onValueChange={setTab}>
            <div className="sticky top-0 z-20 -mt-2 bg-background/85 py-2 backdrop-blur-md">
              <TabsList className="h-11 w-full gap-1 sm:h-10">
                {tabs.map(({ value, label, icon }) => (
                  <TabsTrigger key={value} value={value} className="gap-2">
                    <Icon icon={icon} aria-hidden />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {isAuthenticated && (
              <TabsContent value="following" className={contentAnimation}>
                <FeedListFollowing enabled={activeTab === "following"} />
              </TabsContent>
            )}

            <TabsContent value="global" className={contentAnimation}>
              <FeedListGlobal />
            </TabsContent>

            <TabsContent value="trending" className={contentAnimation}>
              <FeedListTrending enabled={activeTab === "trending"} />
            </TabsContent>
          </Tabs>
        </div>

        {hasSidebar && sessionUser?.username && (
          <aside className="flex flex-col gap-5 md:sticky md:top-4 md:w-1/3 md:shrink-0">
            <StillWatching userId={sessionUser.id} username={sessionUser.username} />
            <StillReading userId={sessionUser.id} username={sessionUser.username} />
          </aside>
        )}
      </div>
    </div>
  );
}
