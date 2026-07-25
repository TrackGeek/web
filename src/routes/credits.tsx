/** biome-ignore-all lint/a11y/useValidAriaRole: it's a component */

import { Icon } from "@iconify/react";
import { useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { ContributorsItem } from "@/components/shared/cards/contributors";
import { CoreTeamItem } from "@/components/shared/cards/core-team";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/credits")({
  ssr: "data-only",
  head: () => ({
    meta: [...seo({ title: "Credits" })],
  }),
  component: CreditsRoute,
});

interface GitHubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

async function fetchRepoContributors(repo: string): Promise<GitHubContributor[]> {
  const response = await fetch(`https://api.github.com/repos/TrackGeek/${repo}/contributors?anon=1`);
  if (!response.ok) throw new Error(`Failed to fetch ${repo} contributors`);
  return response.json();
}

function CreditsRoute() {
  const { t } = useTranslation();

  const queries = useQueries({
    queries: [
      {
        queryKey: ["contributors", "web"],
        queryFn: () => fetchRepoContributors("web"),
        staleTime: 1000 * 60 * 60,
      },
      {
        queryKey: ["contributors", "api"],
        queryFn: () => fetchRepoContributors("api"),
        staleTime: 1000 * 60 * 60,
      },
      {
        queryKey: ["contributors", "mobile-android"],
        queryFn: () => fetchRepoContributors("mobile-android"),
        staleTime: 1000 * 60 * 60,
      },
      {
        queryKey: ["contributors", "mobile-ios"],
        queryFn: () => fetchRepoContributors("mobile-ios"),
        staleTime: 1000 * 60 * 60,
      },
    ],
  });

  const loading = queries.some((query) => query.isPending);
  const contributors = (() => {
    const webContributors = queries[0].data || [];
    const apiContributors = queries[1].data || [];
    const mobileAndroidContributors = queries[2].data || [];
    const mobileIosContributors = queries[3].data || [];

    const allContributors = [
      ...webContributors,
      ...apiContributors,
      ...mobileAndroidContributors,
      ...mobileIosContributors,
    ] as GitHubContributor[];
    return Array.from(
      new Map(allContributors.map((contributor) => [contributor.login?.toLowerCase(), contributor])).values(),
    )
      .sort((a, b) => b.contributions - a.contributions)
      .filter((contributor) => contributor.login)
      .filter((contributor) => !contributor.login?.toLowerCase().includes("bot"));
  })();

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-card rounded-2xl shadow-lg p-8 text-muted-foreground">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
            {t("common:credits")}
          </h1>
          <p className="text-center">{t("pages:credits.description")}</p>
        </div>

        <hr className="my-10" />

        <div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
            {t("pages:credits.core.title")}
          </h2>
          <p className="text-center">{t("pages:credits.core.description")}</p>
          <Grid className="gap-4 mt-4">
            <CoreTeamItem
              name="Kuriel"
              url="/user/kuriel"
              avatarURL="https://github.com/Kuriel23.png"
              role="project-management"
            />
            <CoreTeamItem
              name="izakdvlpr"
              url="/user/izakdvlpr"
              avatarURL="https://github.com/izakdvlpr.png"
              role="project-management"
            />
            <CoreTeamItem
              name="Algiz"
              url="/user/algiz"
              avatarURL="https://i.ibb.co/4Z9wzrbR/image.png"
              role="designer"
            />
          </Grid>
        </div>

        <hr className="my-10" />

        <div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
            {t("pages:credits.community.title")}
          </h2>
          <p className="text-center">{t("pages:credits.community.description")}</p>
          <Grid minColSize="96px" className="gap-2 mt-4">
            {loading ? (
              <p className="text-center col-span-4">{t("common:loading")}</p>
            ) : (
              contributors.map((contributor) => (
                <ContributorsItem
                  key={contributor.login}
                  name={contributor.login}
                  url={contributor.html_url}
                  avatarURL={contributor.avatar_url}
                  roleType="developer"
                />
              ))
            )}
          </Grid>
        </div>

        <hr className="my-10" />

        <div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
            {t("pages:credits.specialThanks.title")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: t("pages:credits.specialThanks.openSource"),
                description: t("pages:credits.specialThanks.openSourceDescription"),
                icon: <Icon icon={"lucide:code"} />,
                bg: "bg-green-500/20 text-green-500",
              },
              {
                title: t("pages:credits.specialThanks.users"),
                description: t("pages:credits.specialThanks.usersDescription"),
                icon: <Icon icon={"lucide:users"} />,
                bg: "bg-red-500/20 text-red-500",
              },
              {
                title: t("pages:credits.specialThanks.translators"),
                description: t("pages:credits.specialThanks.translatorsDescription"),
                icon: <Icon icon={"lucide:languages"} />,
                bg: "bg-blue-500/20 text-blue-500",
              },
            ].map((item) => {
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-xl border border-border bg-linear-to-br from-muted/50 to-muted hover:border-primary/50 translate-y-3 hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={cn(
                      "size-12 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform",
                      item.bg,
                    )}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-10 sm:px-56 bg-linear-to-br from-muted/50 to-muted my-10 rounded-lg text-white flex flex-col items-center gap-y-3 text-center">
          <h3 className="text-4xl sm:text-5xl font-extrabold">{t("pages:credits.wantsToContribute.title")}</h3>
          <p className="text-muted-foreground">{t("pages:credits.wantsToContribute.description")}</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-x-3 gap-y-3 mt-5 w-full justify-center">
            <a href="https://github.com/TrackGeek" target="_blank" rel="noreferrer" className="w-full sm:flex-1">
              <Button className="flex flex-wrap h-12 w-full">
                <Icon icon={"simple-icons:github"} />
                {t("pages:landing.heroButton")}
              </Button>
            </a>
            <a href="https://discord.gg/76bcftRnuT" target="_blank" rel="noreferrer" className="w-full sm:flex-1">
              <Button className="flex flex-wrap h-12 w-full">
                <Icon icon={"simple-icons:discord"} />
                Discord
              </Button>
            </a>
            <a href="https://translate.trackgeek.net" target="_blank" rel="noreferrer" className="w-full sm:flex-1">
              <Button className="flex flex-wrap h-12 w-full">
                <Icon icon={"lucide:languages"} />
                {t("common:translate")}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
