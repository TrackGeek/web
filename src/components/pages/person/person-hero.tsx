import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ShareButton } from "@/components/shared/share-button";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatLongDate } from "@/lib/utils/date";
import { stripMarkdown } from "@/lib/utils/seo";
import { resolveLink } from "@/lib/utils/social";
import type { Person } from "./types";

function ageFrom(birthday: string | null, deathday: string | null): number | null {
  if (!birthday) {
    return null;
  }

  const born = new Date(birthday);
  const reference = deathday ? new Date(deathday) : new Date();
  const age = reference.getFullYear() - born.getFullYear();
  const hasHadBirthday =
    reference.getMonth() > born.getMonth() ||
    (reference.getMonth() === born.getMonth() && reference.getDate() >= born.getDate());

  return hasHadBirthday ? age : age - 1;
}

interface ExternalLink {
  key: string;
  href: string;
  icon: string;
  label: string;
  hover: string;
}

interface ExternalSpec {
  key: string;
  fields: string[];
  icon: string;
  label: string;
  hover: string;
  href: (value: string) => string;
}

function withBase(base: string) {
  return (value: string) => (value.startsWith("http") ? value : `${base}${value}`);
}

function youtubeHref(value: string) {
  if (value.startsWith("http")) {
    return value;
  }

  if (value.includes("/")) {
    return `https://www.youtube.com/${value}`;
  }

  if (value.startsWith("UC")) {
    return `https://www.youtube.com/channel/${value}`;
  }

  return `https://www.youtube.com/@${value.replace(/^@/, "")}`;
}

const EXTERNAL_SPECS: ExternalSpec[] = [
  {
    key: "imdb",
    fields: ["imdb_id", "imdb"],
    icon: "simple-icons:imdb",
    label: "IMDb",
    hover: "hover:text-[#F5C518]",
    href: withBase("https://www.imdb.com/name/"),
  },
  {
    key: "instagram",
    fields: ["instagram_id", "instagram"],
    icon: "simple-icons:instagram",
    label: "Instagram",
    hover: "hover:text-[#FF0069]",
    href: withBase("https://instagram.com/"),
  },
  {
    key: "x",
    fields: ["twitter_id", "twitter", "x"],
    icon: "simple-icons:x",
    label: "X",
    hover: "hover:text-white",
    href: withBase("https://twitter.com/"),
  },
  {
    key: "facebook",
    fields: ["facebook_id", "facebook"],
    icon: "simple-icons:facebook",
    label: "Facebook",
    hover: "hover:text-[#0866FF]",
    href: withBase("https://www.facebook.com/"),
  },
  {
    key: "youtube",
    fields: ["youtube_id", "youtube"],
    icon: "simple-icons:youtube",
    label: "YouTube",
    hover: "hover:text-[#FF0000]",
    href: youtubeHref,
  },
  {
    key: "tiktok",
    fields: ["tiktok_id", "tiktok"],
    icon: "simple-icons:tiktok",
    label: "TikTok",
    hover: "hover:text-white",
    href: withBase("https://www.tiktok.com/@"),
  },
  {
    key: "wikipedia",
    fields: ["wikipedia", "wikipedia_url"],
    icon: "simple-icons:wikipedia",
    label: "Wikipedia",
    hover: "hover:text-foreground",
    href: withBase("https://en.wikipedia.org/wiki/"),
  },
  {
    key: "wikidata",
    fields: ["wikidata_id", "wikidata"],
    icon: "simple-icons:wikidata",
    label: "Wikidata",
    hover: "hover:text-[#006699]",
    href: withBase("https://www.wikidata.org/wiki/"),
  },
  {
    key: "mal",
    fields: ["mal"],
    icon: "simple-icons:myanimelist",
    label: "MyAnimeList",
    hover: "hover:text-[#2E51A2]",
    href: withBase("https://myanimelist.net/people/"),
  },
  {
    key: "anilist",
    fields: ["anilist"],
    icon: "simple-icons:anilist",
    label: "AniList",
    hover: "hover:text-[#02A9FF]",
    href: withBase("https://anilist.co/staff/"),
  },
];

function externalLinks(person: Person) {
  const external = person.external ?? {};
  const links: ExternalLink[] = [];
  const consumed = new Set<string>();

  for (const spec of EXTERNAL_SPECS) {
    const field = spec.fields.find((name) => external[name]);

    for (const name of spec.fields) {
      consumed.add(name);
    }

    if (!field) {
      continue;
    }

    links.push({
      key: spec.key,
      href: spec.href(external[field] as string),
      icon: spec.icon,
      label: spec.label,
      hover: spec.hover,
    });
  }

  for (const [name, value] of Object.entries(external)) {
    if (consumed.has(name) || !value?.startsWith("http")) {
      continue;
    }

    const resolved = resolveLink(value);

    links.push({
      key: name,
      href: value,
      icon: resolved.icon,
      label: resolved.platform ?? resolved.hostname,
      hover: "hover:text-primary",
    });
  }

  if (person.homepage) {
    links.push({
      key: "homepage",
      href: person.homepage,
      icon: "lucide:external-link",
      label: person.homepage,
      hover: "hover:text-primary",
    });
  }

  return links;
}

function MetaItem({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
      <Icon icon={icon} className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

interface PersonHeroProps {
  person: Person;
  backdropUrl: string | null;
  canFavorite?: boolean;
  isFavorited?: boolean;
  favoriteDisabled?: boolean;
  onToggleFavorite?: () => void;
}

export function PersonHero({
  person,
  backdropUrl,
  canFavorite,
  isFavorited,
  favoriteDisabled,
  onToggleFavorite,
}: PersonHeroProps) {
  const { t, i18n } = useTranslation();
  const age = ageFrom(person.birthday, person.deathday);
  const links = externalLinks(person);
  const shareText =
    person.source === "anilist" && person.biography ? stripMarkdown(person.biography) : (person.biography ?? undefined);

  return (
    <header className="relative overflow-hidden rounded-xl border border-border">
      <div className="absolute inset-0" aria-hidden="true">
        {backdropUrl ? (
          <div
            className="absolute inset-0 scale-110 bg-center bg-cover blur-2xl saturate-150"
            style={{ backgroundImage: `url("${backdropUrl}")` }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-background to-background" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/85 to-background/50" />
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {canFavorite && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon-sm"
                aria-label={t("common:favorite")}
                aria-pressed={isFavorited}
                disabled={favoriteDisabled}
                onClick={onToggleFavorite}
                className="backdrop-blur-sm"
              >
                <Icon icon="lucide:heart" className={cn(isFavorited && "fill-red-500 text-red-500")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("common:favorite")}</TooltipContent>
          </Tooltip>
        )}

        <ShareButton title={person.name} text={shareText} />
      </div>

      <div className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-end md:gap-8 md:p-8">
        <div className="w-36 shrink-0 overflow-hidden rounded-xl border border-border shadow-2xl sm:w-44 md:w-52">
          {person.imageUrl ? (
            <Image
              src={person.imageUrl}
              width={400}
              height={533}
              alt={person.name}
              className="aspect-3/4 w-full object-cover"
            />
          ) : (
            <div className="flex aspect-3/4 w-full items-center justify-center bg-muted">
              <Icon icon="lucide:user-round" className="size-12 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
          {person.knownForDepartment && (
            <p className="font-semibold text-primary text-xs uppercase tracking-[0.2em]">{person.knownForDepartment}</p>
          )}

          <h1 className="text-balance font-bold text-3xl text-card-foreground leading-tight md:text-5xl">
            {person.name}
          </h1>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
            {person.birthday && (
              <MetaItem icon="lucide:cake">
                {formatLongDate(person.birthday, i18n.language)}
                {age !== null && ` · ${t("library:yearsOld", { count: age })}`}
              </MetaItem>
            )}
            {person.deathday && (
              <MetaItem icon="lucide:flower">{formatLongDate(person.deathday, i18n.language)}</MetaItem>
            )}
            {person.placeOfBirth && <MetaItem icon="lucide:map-pin">{person.placeOfBirth}</MetaItem>}
            <MetaItem icon="lucide:layers">{t("library:creditCount", { count: person.stats.total })}</MetaItem>
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
                  className={`flex size-11 items-center justify-center rounded-lg border border-border bg-card/60 text-muted-foreground backdrop-blur-sm transition-colors ${link.hover}`}
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
