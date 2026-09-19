import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useGithubStars } from "@/hooks/github";
import { useReveal, useSpotlight } from "@/hooks/reveal";

export function Trust() {
  const { t } = useTranslation();
  const revealRef = useReveal<HTMLElement>({ y: 30, step: 85, duration: 850 });
  const spotlightRef = useSpotlight<HTMLDivElement>();
  const { data: stars } = useGithubStars();

  const pillars = [
    {
      icon: "lucide:git-branch",
      title: t("pages:landing.trustOpenSourceTitle"),
      description: t("pages:landing.trustOpenSourceDescription"),
    },
    {
      icon: "lucide:server",
      title: t("pages:landing.trustSelfHostTitle"),
      description: t("pages:landing.trustSelfHostDescription"),
    },
    {
      icon: "lucide:shield-check",
      title: t("pages:landing.trustPrivacyTitle"),
      description: t("pages:landing.trustPrivacyDescription"),
    },
    {
      icon: "lucide:download",
      title: t("pages:landing.trustExportTitle"),
      description: t("pages:landing.trustExportDescription"),
    },
  ];

  return (
    <section ref={revealRef} className="relative overflow-hidden border-y border-border/50 py-24">
      <div
        className="tg-aurora pointer-events-none absolute inset-x-0 -bottom-56 h-[560px] rotate-180 opacity-40"
        aria-hidden
      />

      <div className="relative container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 data-reveal className="anim-hidden mb-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t("pages:landing.trustTitle")}
          </h2>
          <p data-reveal className="anim-hidden text-muted-foreground text-balance">
            {t("pages:landing.trustDescription")}
          </p>
        </div>

        <div ref={spotlightRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              data-reveal
              data-spotlight
              className="tg-spotlight anim-hidden h-full rounded-xl border border-border/60 bg-card/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon icon={pillar.icon} className="size-5" />
              </div>
              <h3 className="mb-2 text-base font-semibold">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
            </div>
          ))}
        </div>

        <div data-reveal className="anim-hidden mt-12 flex justify-center">
          <a
            href="https://github.com/TrackGeek/"
            target="_blank"
            rel="noopener noreferrer"
            title={typeof stars === "number" ? t("pages:landing.githubStars", { count: stars }) : undefined}
          >
            <Button
              variant="outline"
              className="h-11 gap-2 rounded-lg px-6 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Icon icon="lucide:github" />
              {t("pages:landing.trustAction")}
              {typeof stars === "number" && stars > 0 && (
                <span className="ml-1 inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 text-xs tabular-nums">
                  <Icon icon="lucide:star" className="size-3 text-primary" />
                  {stars.toLocaleString()}
                </span>
              )}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
