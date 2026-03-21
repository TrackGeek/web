import { createTimeline, random, stagger } from "animejs";
import { Book, Gamepad, Ghost } from "lucide-react";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { t } = useTranslation();

  useEffect(() => {
    const tl = createTimeline({
      playbackEase: "easeOutExpo",
      duration: 1000,
    });

    tl.add(
      ".hero-badge",
      {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 800,
      },
      "-=600",
    )
      .add(
        ".hero-text",
        {
          translateY: [50, 0],
          opacity: [0, 1],
          delay: stagger(150),
          duration: 1200,
        },
        "-=800",
      )
      .add(
        ".hero-cta",
        {
          translateY: [20, 0],
          opacity: [0, 1],
          duration: 1000,
        },
        "-=800",
      )
      .add(
        ".hero-card",
        {
          opacity: [0, 1],
          scale: [0.8, 1],
          rotate: () => {
            return random(-10, 10);
          },
          delay: stagger(200),
          duration: 1200,
          elasticity: 600,
        },
        "-=1000",
      );

    tl.play();
  }, []);
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium text-secondary mb-8 hero-badge opacity-0 translate-y-4">
          <span className="flex size-2 rounded-full bg-green-500 mr-2"></span>
          {t("pages:landing.alive")}
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 hero-text opacity-0 max-w-lg mx-auto">
          <Trans
            i18nKey="pages:landing.heroTitle"
            components={{
              1: (
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
                  Geek Journey
                </span>
              ),
            }}
          ></Trans>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 hero-text opacity-0 leading-relaxed">
          {t("pages:landing.heroDescription")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 hero-cta opacity-0 translate-y-8">
          <Button className="h-12 px-8 rounded-lg font-medium text-base hover:scale-105 transition-transform duration-200 shadow-lg shadow-primary/20">
            {t("pages:landing.CTAButton")}
          </Button>
          <a href="https://github.com/TrackGeek/" target="_blank" rel="noopener noreferrer">
            <Button className="h-12 px-8 rounded-lg font-medium text-base transition-colors">
              {t("pages:landing.heroButton")}
            </Button>
          </a>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-full pointer-events-none z-0 hidden lg:block">
        <div className="hero-card absolute top-[10%] left-[10%] w-64 p-4 rounded-xl border border-border bg-card shadow-2xl opacity-0 transform -rotate-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Ghost />
            </div>
            <div>
              <div className="text-sm font-semibold">Jujutsu Kaisen</div>
              <div className="text-xs text-muted-foreground">
                {t("common:types.anime")} • {t("library:episode")} 24
              </div>
            </div>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-[90%]"></div>
          </div>
        </div>

        <div className="hero-card absolute top-[20%] right-[10%] w-64 p-4 rounded-xl border border-border bg-card shadow-2xl opacity-0 transform rotate-[4deg]">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Gamepad />
            </div>
            <div>
              <div className="text-sm font-semibold">Elden Ring</div>
              <div className="text-xs text-muted-foreground">
                {t("common:types.game")} • 120h {t("feed:lists.played")}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="h-1.5 flex-1 bg-blue-500 rounded-sm"></div>
            <div className="h-1.5 flex-1 bg-blue-500 rounded-sm"></div>
            <div className="h-1.5 flex-1 bg-blue-500 rounded-sm"></div>
            <div className="h-1.5 flex-1 bg-blue-500/30 rounded-sm"></div>
            <div className="h-1.5 flex-1 bg-blue-500/30 rounded-sm"></div>
          </div>
        </div>

        <div className="hero-card absolute bottom-[15%] left-[20%] w-64 p-4 rounded-xl border border-border bg-card shadow-2xl opacity-0 transform -rotate-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
              <Book />
            </div>
            <div>
              <div className="text-sm font-semibold">Dune</div>
              <div className="text-xs text-muted-foreground">
                {t("common:types.book")} • {t("library:page")} 412/890
              </div>
            </div>
          </div>
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div className="bg-yellow-500 h-full w-[46.29%]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
