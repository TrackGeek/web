import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CreditsSection } from "./credits-section";
import { PersonHero } from "./person-hero";
import type { Person } from "./types";

const BIOGRAPHY_CLAMP_LENGTH = 480;

function Biography({ biography, name }: { biography: string; name: string }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isLong = biography.length > BIOGRAPHY_CLAMP_LENGTH;

  return (
    <section className="space-y-3" aria-labelledby="biography-heading">
      <h2 id="biography-heading" className="font-bold text-2xl text-card-foreground">
        {t("library:biography")}
      </h2>

      <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
        {isLong && !expanded ? `${biography.slice(0, BIOGRAPHY_CLAMP_LENGTH).trimEnd()}…` : biography}
      </p>

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

export function PersonPage({ person }: { person: Person }) {
  const { t } = useTranslation();
  const backdropUrl = useMemo(
    () => person.credits.find((credit) => credit.backdropUrl)?.backdropUrl ?? null,
    [person.credits],
  );

  return (
    <div className="mx-auto w-full space-y-8">
      <PersonHero person={person} backdropUrl={backdropUrl} />

      {person.biography && <Biography biography={person.biography} name={person.name} />}

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

      <CreditsSection credits={person.credits} />
    </div>
  );
}
