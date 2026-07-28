/** biome-ignore-all lint/a11y/useAnchorContent: component use */

import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-border/30 backdrop-blur border-t border-border w-full px-4 md:px-8 py-6">
      <div className="flex flex-col lg:flex-row md:items-center justify-between gap-8">
        <div className="flex flex-col justify-center gap-3">
          <Link to="/" search={{ landing: "true" }}>
            <img src="/logo.svg" alt="Logo" className="h-full w-45" />
          </Link>
          <div className="flex flex-col gap-2">
            <p className="flex gap-1 items-center">
              {t("common:providers.IGDBMetadata")}
              <a href="https://www.igdb.com" target="_blank" rel="noopener noreferrer">
                <Icon icon={"simple-icons:igdb"} />
              </a>
            </p>
            <p className="flex gap-1 items-center">
              {t("common:providers.TMDBMetadata")}
              <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">
                <Icon icon={"simple-icons:themoviedatabase"} />
              </a>
            </p>
            <p className="flex gap-1 items-center">
              <Trans
                i18nKey="common:providers.HardCoverMetadata"
                components={{
                  1: <a href="https://hardcover.app" target="_blank" rel="noopener noreferrer" />,
                }}
              />
            </p>
            <p className="flex flex-wrap gap-1 items-center">
              <Trans
                i18nKey="common:providers.MALMetadata"
                components={{
                  mal: (
                    <a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer">
                      <Icon icon={"simple-icons:myanimelist"} />
                    </a>
                  ),
                  tenrai: <a href="https://tenrai.org" target="_blank" rel="noopener noreferrer" />,
                }}
              />
            </p>
            <p className="flex flex-wrap gap-1 items-center">
              <Trans
                i18nKey="common:providers.ALMetadata"
                components={{
                  al: (
                    <a href="https://anilist.co" target="_blank" rel="noopener noreferrer">
                      <Icon icon={"simple-icons:anilist"} />
                    </a>
                  ),
                }}
              />
            </p>
          </div>
        </div>

        <div className="flex max-sm:flex-col gap-8 lg:gap-12 justify-between w-1/2">
          <div className="flex flex-col gap-3">
            <h3 className="text-accent font-bold">{t("common:community")}</h3>

            <Link to="/add-data">{t("common:addData")}</Link>
            <Link to="/donate">{t("common:donate")}</Link>
            <Link to="/credits">{t("common:credits")}</Link>
            <a href="https://translate.trackgeek.net" target="_blank" rel="noopener noreferrer">
              {t("common:translate")}
            </a>
            <a href="https://github.com/orgs/TrackGeek/projects/1" target="_blank" rel="noopener noreferrer">
              {t("common:roadmap")}
            </a>
            <a href="https://github.com/orgs/TrackGeek/discussions" target="_blank" rel="noopener noreferrer">
              {t("common:feedback")}
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-accent font-bold">{t("common:legal")}</h3>

            <Link to="/tos">{t("common:terms")}</Link>
            <Link to="/privacy-policy">{t("common:privacy")}</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-accent font-bold">{t("common:socials")}</h3>

            <a href="https://bsky.app/profile/trackgeek.net" target="_blank" rel="noopener noreferrer">
              BlueSky
            </a>

            <a href="https://discord.gg/76bcftRnuT" target="_blank" rel="noopener noreferrer">
              Discord
            </a>

            <a href="https://www.instagram.com/trackgeekofc" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>

            <a href="https://x.com/trackgeekofc" target="_blank" rel="noopener noreferrer">
              X (Twitter)
            </a>

            <a href="https://github.com/TrackGeek/" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
