import { Icon } from "@iconify/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CompanyHero } from "./company-hero";
import type { Company } from "./types";
import { WorksSection } from "./works-section";

const DESCRIPTION_CLAMP_LENGTH = 480;

function Description({ description, name }: { description: string; name: string }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > DESCRIPTION_CLAMP_LENGTH;

  return (
    <section className="space-y-3" aria-labelledby="company-about-heading">
      <h2 id="company-about-heading" className="font-bold text-2xl text-card-foreground">
        {t("library:companyAbout")}
      </h2>

      <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
        {isLong && !expanded ? `${description.slice(0, DESCRIPTION_CLAMP_LENGTH).trimEnd()}…` : description}
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

export function CompanyPage({ company }: { company: Company }) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full space-y-8">
      <CompanyHero company={company} />

      {company.description && <Description description={company.description} name={company.name} />}

      {company.alsoKnownAs.length > 0 && (
        <section className="space-y-3" aria-labelledby="company-also-known-as-heading">
          <h2 id="company-also-known-as-heading" className="font-bold text-2xl text-card-foreground">
            {t("library:alsoKnownAs")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {company.alsoKnownAs.map((alias) => (
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

      <WorksSection mediaType={company.mediaType} works={company.works} />
    </div>
  );
}
