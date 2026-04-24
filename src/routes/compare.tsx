import { Icon } from "@iconify/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { ComparisonTable } from "@/components/pages/compare/comparison-table";
import { Button } from "@/components/ui/button";
import { comparisonCriteria, comparisonEntries, comparisonPlatforms } from "@/lib/comparison.config";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      ...seo({
        title: t("pages:compare.metaTitle"),
        description: t("pages:compare.metaDescription"),
      }),
    ],
  }),
  component: CompareRoute,
});

function CompareRoute() {
  const { t } = useTranslation();
  return (
    <main className="mx-auto flex w-full flex-col gap-8 py-4 md:gap-10">
      <section className="rounded-2xl border border-border bg-linear-to-br from-card to-muted/20 p-6 shadow-sm md:p-10">
        <h1 className="mt-2 bg-linear-to-r from-primary to-primary-foreground bg-clip-text text-3xl font-black text-transparent md:text-5xl">
          {t("pages:compare.heroTitle")}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground md:text-base">{t("pages:compare.heroDescription")}</p>
      </section>

      <ComparisonTable criteria={comparisonCriteria} platforms={comparisonPlatforms} entries={comparisonEntries} />

      <section className="rounded-2xl border border-primary/30 bg-primary/10 p-6 shadow-sm md:p-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t("pages:landing.CTATitle")}</h2>
            <p className="text-sm text-muted-foreground md:text-base">{t("pages:landing.CTADescription")}</p>
          </div>

          <Button asChild size="lg" className="min-w-52">
            <Link to="/" search={{ landing: "true" }}>
              {t("pages:landing.CTAButton")} <Icon icon={"lucide:arrow-right"} className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
