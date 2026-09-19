import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useReveal, useSpotlight } from "@/hooks/reveal";
import { cn } from "@/lib/utils";

export function Features() {
  const { t } = useTranslation();
  const revealRef = useReveal<HTMLElement>({ y: 32, step: 80, duration: 850 });
  const spotlightRef = useSpotlight<HTMLDivElement>();

  const features = [
    {
      title: t("pages:landing.moviesTVShows"),
      description: t("pages:landing.moviesTVShowsDescription"),
      icon: "lucide:film",
      tone: "bg-pink-500/15 text-pink-400 group-hover:bg-pink-500/25",
    },
    {
      title: t("pages:landing.animeManga"),
      description: t("pages:landing.animeMangaDescription"),
      icon: "fluent-emoji-high-contrast:japanese-castle",
      tone: "bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25",
    },
    {
      title: t("common:types.game_other"),
      description: t("pages:landing.gamesDescription"),
      icon: "lucide:gamepad",
      tone: "bg-blue-500/15 text-blue-400 group-hover:bg-blue-500/25",
    },
    {
      title: t("common:types.book_other"),
      description: t("pages:landing.booksDescription"),
      icon: "lucide:book",
      tone: "bg-yellow-500/15 text-yellow-400 group-hover:bg-yellow-500/25",
    },
    {
      title: t("pages:landing.advancedProgress"),
      description: t("pages:landing.advancedProgressDescription"),
      icon: "lucide:pencil",
      tone: "bg-green-500/15 text-green-400 group-hover:bg-green-500/25",
    },
    {
      title: t("pages:landing.socialFeed"),
      description: t("pages:landing.socialFeedDescription"),
      icon: "lucide:users",
      tone: "bg-red-500/15 text-red-400 group-hover:bg-red-500/25",
    },
  ];

  return (
    <section ref={revealRef} className="bg-secondary/[0.04] py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 data-reveal className="anim-hidden mb-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t("pages:landing.featuresTitle")}
          </h2>
          <p data-reveal className="anim-hidden text-muted-foreground text-balance">
            {t("pages:landing.featuresDescription")}
          </p>
        </div>

        <div ref={spotlightRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              data-reveal
              data-spotlight
              className="tg-spotlight anim-hidden group rounded-xl border border-border/60 bg-card/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
            >
              <div
                className={cn(
                  "mb-4 flex size-12 items-center justify-center rounded-lg text-xl transition-all duration-300 group-hover:scale-110",
                  feature.tone,
                )}
              >
                <Icon icon={feature.icon} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
