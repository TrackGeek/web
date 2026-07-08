import { Icon } from "@iconify/react";
import { animate } from "animejs";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function Features() {
  const { t } = useTranslation();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target as HTMLElement;

          const simple = (props: any) => {
            animate(el, { ...props });
            observer.unobserve(el);
          };

          if (el.classList.contains("feature-card")) simple({ opacity: [0, 1], translateY: [30, 0], duration: 800 });

          if (el.classList.contains("feature-head")) simple({ opacity: [0, 1], translateY: [20, 0], duration: 1000 });
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    document.querySelectorAll(".feature-card, .feature-head").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 feature-head opacity-0">
          <h2 className="text-3xl font-bold mb-3">{t("pages:landing.featuresTitle")}</h2>
          <p className="text-muted-foreground">{t("pages:landing.featuresDescription")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: t("pages:landing.moviesTVShows"),
              description: t("pages:landing.moviesTVShowsDescription"),
              icon: <Icon icon={"lucide:film"} />,
              bg: "bg-pink-500/20 text-pink-500",
            },
            {
              title: t("pages:landing.animeManga"),
              description: t("pages:landing.animeMangaDescription"),
              icon: <Icon icon={"fluent-emoji-high-contrast:japanese-castle"} />,
              bg: "bg-purple-500/20 text-purple-500",
            },
            {
              title: t("common:types.game_other"),
              description: t("pages:landing.gamesDescription"),
              icon: <Icon icon={"lucide:gamepad"} />,
              bg: "bg-blue-500/20 text-blue-500",
            },
            {
              title: t("common:types.book_other"),
              description: t("pages:landing.booksDescription"),
              icon: <Icon icon={"lucide:book"} />,
              bg: "bg-yellow-500/20 text-yellow-500",
            },
            {
              title: t("pages:landing.advancedProgress"),
              description: t("pages:landing.advancedProgressDescription"),
              icon: <Icon icon={"lucide:pencil"} />,
              bg: "bg-green-500/20 text-green-500",
            },
            {
              title: t("pages:landing.socialFeed"),
              description: t("pages:landing.socialFeedDescription"),
              icon: <Icon icon={"lucide:users"} />,
              bg: "bg-red-500/20 text-red-500",
            },
          ].map((item) => {
            return (
              <div
                key={item.title}
                className="feature-card group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 opacity-0 translate-y-8 hover:-translate-y-1"
              >
                <div
                  className={cn(
                    "size-12 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform",
                    item.bg,
                  )}
                >
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
