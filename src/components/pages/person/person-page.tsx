import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Markdown } from "@/components/shared/comments/markdown";
import { Button } from "@/components/ui/button";
import { useFavoriteStatus, useToggleFavorite } from "@/hooks/favorite";
import { useSession } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { CreditsSection } from "./credits-section";
import { PersonHero } from "./person-hero";
import type { Person } from "./types";

const BIOGRAPHY_CLAMP_LENGTH = 480;

function Biography({ biography, name, markdown }: { biography: string; name: string; markdown?: boolean }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isLong = biography.length > BIOGRAPHY_CLAMP_LENGTH;

  return (
    <section className="space-y-3" aria-labelledby="biography-heading">
      <h2 id="biography-heading" className="font-bold text-2xl text-card-foreground">
        {t("library:biography")}
      </h2>

      {markdown ? (
        <Markdown className={cn("text-base text-muted-foreground", isLong && !expanded && "line-clamp-6")}>
          {biography}
        </Markdown>
      ) : (
        <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
          {isLong && !expanded ? `${biography.slice(0, BIOGRAPHY_CLAMP_LENGTH).trimEnd()}…` : biography}
        </p>
      )}

      {isLong && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded((current) => !current)}
          aria-label={`${expanded ? t("library:showLess") : t("library:readMore")} — ${name}`}
        >
          <Icon icon={expanded ? "lucide:chevron-up" : "lucide:chevron-down"} aria-hidden="true" />
          {expanded ? t("library:showLess") : t("library:readMore")}
        </Button>
      )}
    </section>
  );
}

export function PersonPage({ person, creditsHeading }: { person: Person; creditsHeading?: string }) {
  const { t } = useTranslation();
  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  const backdropUrl = useMemo(
    () => person.credits.find((credit) => credit.backdropUrl)?.backdropUrl ?? null,
    [person.credits],
  );

  const favoriteStatusQuery = useFavoriteStatus("person", person.id, isAuthenticated);
  const isFavorited = !!favoriteStatusQuery.data;
  const toggleFavoriteMutation = useToggleFavorite("person", person.id);

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate(isFavorited, {
      onError: () => {
        toast.error(t("api:INTERNAL_SERVER_ERROR"));
      },
    });
  };

  return (
    <div className="mx-auto w-full space-y-8">
      <PersonHero
        person={person}
        backdropUrl={backdropUrl}
        canFavorite={isAuthenticated}
        isFavorited={isFavorited}
        favoriteDisabled={favoriteStatusQuery.isLoading || toggleFavoriteMutation.isPending}
        onToggleFavorite={handleToggleFavorite}
      />

      {person.biography && (
        <Biography biography={person.biography} name={person.name} markdown={person.source === "anilist"} />
      )}

      {person.alsoKnownAs.length > 0 && (
        <section className="space-y-3" aria-labelledby="also-known-as-heading">
          <h2 id="also-known-as-heading" className="font-bold text-2xl text-card-foreground">
            {t("library:alsoKnownAs")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {person.alsoKnownAs.map((alias) => (
              <li
                key={alias}
                className="rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-sm"
              >
                {alias}
              </li>
            ))}
          </ul>
        </section>
      )}

      <CreditsSection credits={person.credits} heading={creditsHeading} />
    </div>
  );
}
