import { Icon } from "@iconify/react";
import { animate, createSpring } from "animejs";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { prefersReducedMotion, useReveal } from "@/hooks/reveal";

const TOTAL_EPISODES = 6;

export function Demo() {
  const { t } = useTranslation();
  const textRef = useReveal<HTMLDivElement>({ x: -32, y: 0, step: 70, duration: 900 });
  const uiRef = useReveal<HTMLDivElement>({ x: 32, y: 0, duration: 950 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const initialWidth = useRef(`${(4 / TOTAL_EPISODES) * 100}%`).current;

  const [watched, setWatched] = useState(4);
  const [isAnimating, setIsAnimating] = useState(false);

  const isComplete = watched >= TOTAL_EPISODES;
  const nextEpisode = Math.min(watched + 1, TOTAL_EPISODES);

  const benefits = [
    { icon: "lucide:refresh-cw", label: t("pages:landing.crossDevice") },
    { icon: "lucide:bell", label: t("pages:landing.notifications") },
    { icon: "lucide:trending-up", label: t("pages:landing.progress") },
    { icon: "lucide:list", label: t("pages:landing.lists") },
    { icon: "lucide:heart", label: t("pages:landing.favorites") },
    { icon: "lucide:rss", label: t("pages:landing.feed") },
    { icon: "lucide:image-up", label: t("pages:landing.upload") },
    { icon: "lucide:git-fork", label: t("pages:landing.related") },
    { icon: "lucide:eye-off", label: t("pages:landing.hideContent") },
    { icon: "lucide:layout-grid", label: t("pages:landing.cleanLayout") },
    { icon: "lucide:sliders-horizontal", label: t("pages:landing.settings") },
  ];

  const moveBar = (value: number) => {
    const bar = barRef.current;

    if (!bar) return;

    const width = `${(value / TOTAL_EPISODES) * 100}%`;

    if (prefersReducedMotion()) {
      bar.style.width = width;

      return;
    }

    animate(bar, { width, ease: createSpring({ stiffness: 110, damping: 16 }) });
  };

  const handleTrack = () => {
    if (isComplete || isAnimating) return;

    setIsAnimating(true);

    const next = watched + 1;

    if (buttonRef.current && !prefersReducedMotion()) {
      animate(buttonRef.current, { scale: [1, 0.96, 1], duration: 260, ease: "outQuad" });
    }

    setWatched(next);
    moveBar(next);

    if (next === TOTAL_EPISODES) {
      toast.success(t("pages:landing.toastCongrats"));
    } else {
      toast.success(t("pages:landing.toastMark", { number: next }));
    }

    setTimeout(() => setIsAnimating(false), 450);
  };

  const handleReset = () => {
    setWatched(0);
    moveBar(0);
  };

  return (
    <section className="relative overflow-hidden py-24">
      <div className="container mx-auto flex flex-col items-center gap-16 px-4 lg:flex-row">
        <div ref={textRef} className="space-y-6 lg:w-1/2">
          <div
            data-reveal
            className="anim-hidden flex size-12 items-center justify-center rounded-lg bg-primary/15 text-xl text-primary"
          >
            <Icon icon="lucide:wand" />
          </div>

          <h2 data-reveal className="anim-hidden text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t("pages:landing.demoTitle")}
          </h2>

          <p data-reveal className="anim-hidden text-lg text-muted-foreground">
            {t("pages:landing.demoDescription")}
          </p>

          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li key={benefit.label} data-reveal className="anim-hidden flex items-start gap-3 text-muted-foreground">
                <Icon icon={benefit.icon} className="mt-1 size-4 shrink-0 text-primary" />
                <span className="text-sm leading-relaxed">{benefit.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div ref={uiRef} className="w-full lg:w-1/2">
          <div
            data-reveal
            className="anim-hidden relative mx-auto max-w-md overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl"
          >
            <div className="relative flex h-40 flex-col justify-end bg-gradient-to-r from-muted/50 to-muted p-6">
              <div
                className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/pjBUCUZ6dZgapy2SRoPw0WFEzrf.jpg')] bg-cover opacity-70 mix-blend-overlay"
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" aria-hidden />

              <span className="relative z-10 mb-2 w-fit rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                {isComplete ? t("library:statusAir.finished") : t("pages:landing.watchingNow")}
              </span>
              <h3 className="relative z-10 text-2xl font-bold text-white">Game of Thrones</h3>
              <p className="relative z-10 text-sm text-muted-foreground">
                {t("library:season")} 8 • {t("library:episode")} {nextEpisode}
              </p>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("pages:landing.seasonProgress")}</span>
                <span className="font-mono text-sm font-bold tabular-nums">
                  {watched}/{TOTAL_EPISODES} {t("library:episode_other")}
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={watched}
                aria-valuemin={0}
                aria-valuemax={TOTAL_EPISODES}
                aria-label={t("pages:landing.seasonProgress")}
                className="relative h-4 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  ref={barRef}
                  className="h-full rounded-full bg-gradient-to-r from-malachite-600 to-primary"
                  style={{ width: initialWidth }}
                />
              </div>

              <div className="space-y-3 border-t border-border/60 pt-4">
                <Button
                  ref={buttonRef}
                  onClick={handleTrack}
                  disabled={isComplete}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium"
                >
                  <Icon icon="lucide:plus" className="transition-transform duration-200 group-hover:rotate-90" />
                  {isComplete
                    ? t("library:statusAir.finished")
                    : t("pages:landing.markEpisode", { number: watched + 1 })}
                </Button>

                {isComplete ? (
                  <Button variant="ghost" onClick={handleReset} className="w-full gap-2 text-muted-foreground">
                    <Icon icon="lucide:rotate-ccw" />
                    {t("pages:landing.demoReplay")}
                  </Button>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">{t("pages:landing.demoHint")}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
