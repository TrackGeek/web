import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/client";
import { openAuthModal } from "@/lib/auth/modal";

const providers = [
  {
    name: "MyAnimeList",
    icon: "simple-icons:myanimelist",
    to: "/settings/import/myanimelist",
    type: "common:types.anime",
    method: "pages:landing.import.exportFile",
  },
  {
    name: "AniList",
    icon: "simple-icons:anilist",
    to: "/settings/import/anilist",
    type: "pages:landing.animeManga",
    method: "pages:compare.criteria.public-profile.label",
  },
  {
    name: "Backloggd",
    icon: "lucide:gamepad-2",
    to: "/settings/import/backloggd",
    type: "common:types.game_other",
    method: "pages:landing.import.backloggdExport",
  },
] as const;

export function Import() {
  const { t } = useTranslation();
  const session = useSession();
  const isAuthenticated = !!session.data?.session;

  const providerClass =
    "flex min-w-0 items-center gap-3 rounded-xl border border-border/50 bg-background/70 p-3 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-malachite-300 active:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-4 sm:p-5";

  return (
    <section aria-labelledby="import-title" className="px-4 py-16 md:py-24">
      <div className="container mx-auto rounded-2xl border border-primary/30 bg-card/60">
        <div className="grid min-w-0 gap-10 p-5 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:p-14">
          <div className="min-w-0">
            <h2
              id="import-title"
              className="min-w-0 text-3xl font-bold tracking-tight text-balance [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl"
            >
              {t("pages:landing.import.title")}
              <span className="mt-2 block text-malachite-300">{t("pages:landing.import.titleAccent")}</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("pages:landing.import.description")}
            </p>
            <p className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <Icon icon="lucide:arrow-right-left" className="mt-0.5 size-5 shrink-0 text-malachite-300" aria-hidden />
              {t("pages:landing.import.hint")}
            </p>
          </div>

          <div className="min-w-0">
            <ul className="space-y-3">
              {providers.map((provider) => {
                const content = (
                  <>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-white sm:size-12">
                      <Icon icon={provider.icon} className="size-6 sm:size-7" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block whitespace-nowrap text-sm font-semibold sm:text-base">
                        {provider.name}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {t(provider.type)}
                      </span>
                    </span>
                    <span className="hidden rounded-md bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground sm:block lg:hidden xl:block">
                      {t(provider.method)}
                    </span>
                  </>
                );

                return (
                  <li key={provider.name}>
                    {isAuthenticated ? (
                      <Link
                        to={provider.to}
                        className={providerClass}
                        aria-label={t("pages:landing.import.providerAction", { provider: provider.name })}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openAuthModal("register")}
                        className={`${providerClass} w-full cursor-pointer`}
                        aria-label={t("pages:landing.import.providerAction", { provider: provider.name })}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div aria-hidden className="flex justify-center py-4 text-malachite-300">
              <Icon icon="lucide:arrow-down" className="size-6" />
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-primary/40 bg-primary/10 p-4 sm:p-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Icon icon="lucide:library" className="size-6" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-bold tracking-tight">TrackGeek</p>
                <p className="mt-1 text-sm text-malachite-200">{t("pages:landing.import.destination")}</p>
              </div>
              <Icon icon="lucide:check" className="ml-auto size-5 shrink-0 text-malachite-300" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
