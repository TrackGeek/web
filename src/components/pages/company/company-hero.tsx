import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ShareButton } from "@/components/shared/share-button";
import type { Company } from "./types";

const MEDIA_LABELS: Record<Company["mediaType"], string> = {
  movie: "library:productionCompanies",
  tv: "library:productionCompanies",
  anime: "library:studios",
  game: "library:developers",
};

function MetaItem({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
      <Icon icon={icon} className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

export function CompanyHero({ company }: { company: Company }) {
  const { t } = useTranslation();
  const foundedYear = company.foundedAt ? new Date(company.foundedAt).getFullYear() : null;
  const links = [
    ...(company.homepage
      ? [{ key: "homepage", href: company.homepage, icon: "lucide:external-link", label: company.homepage }]
      : []),
    ...company.external.map((link) => ({
      key: link.url,
      href: link.url,
      icon: link.name === "MyAnimeList" ? "simple-icons:myanimelist" : "lucide:link",
      label: link.name,
    })),
  ];

  return (
    <header className="relative overflow-hidden rounded-xl border border-border">
      <div className="absolute inset-0" aria-hidden="true">
        {company.bannerUrl ? (
          <div
            className="absolute inset-0 scale-110 bg-center bg-cover blur-2xl saturate-150"
            style={{ backgroundImage: `url("${company.bannerUrl}")` }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-background to-background" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/85 to-background/50" />
      </div>

      <ShareButton
        title={company.name}
        text={company.description ?? undefined}
        className="absolute top-4 right-4 z-10"
      />

      <div className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-end md:gap-8 md:p-8">
        <div className="flex w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card/80 p-4 shadow-2xl sm:w-44 md:w-52">
          {company.logoUrl ? (
            <Image
              src={company.logoUrl}
              width={400}
              height={225}
              alt={company.name}
              className="h-auto w-full object-contain"
            />
          ) : (
            <Icon icon="lucide:building" className="size-16 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
          <p className="font-semibold text-primary text-xs uppercase tracking-[0.2em]">
            {t(MEDIA_LABELS[company.mediaType])}
          </p>

          <h1 className="text-balance font-bold text-3xl text-card-foreground leading-tight md:text-5xl">
            {company.name}
          </h1>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
            {foundedYear && <MetaItem icon="lucide:calendar">{`${t("library:founded")} ${foundedYear}`}</MetaItem>}
            {company.headquarters && <MetaItem icon="lucide:map-pin">{company.headquarters}</MetaItem>}
            {company.originCountry && <MetaItem icon="lucide:globe">{company.originCountry}</MetaItem>}
            <MetaItem icon="lucide:layers">{t("library:titleCount", { count: company.stats.total })}</MetaItem>
          </div>

          {links.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 pt-1 sm:justify-start">
              {links.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex size-11 items-center justify-center rounded-lg border border-border bg-card/60 text-muted-foreground backdrop-blur-sm transition-colors hover:text-primary"
                >
                  <Icon icon={link.icon} className="size-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
