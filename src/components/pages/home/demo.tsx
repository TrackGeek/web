import { Icon } from "@iconify/react";
import { animate } from "animejs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function Demo() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const [watched, setWatched] = useState(4);
  const total = 6;
  const [isAnimating, setIsAnimating] = useState(false);
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

          if (el.classList.contains("demo-text")) simple({ opacity: [0, 1], translateX: [-30, 0], duration: 1000 });

          if (el.classList.contains("demo-ui"))
            simple({
              opacity: [0, 1],
              translateX: [30, 0],
              duration: 1000,
              delay: 200,
            });
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    document.querySelectorAll(".demo-text, .demo-ui").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleTrack = () => {
    if (watched >= total || isAnimating) return;
    setIsAnimating(true);

    animate(btnRef.current as HTMLButtonElement, {
      scale: [1, 0.95, 1],
      duration: 200,
      easing: "easeInOutQuad",
    });

    const next = watched + 1;
    const percent = (next / total) * 100;

    animate(barRef.current as HTMLDivElement, {
      width: `${percent}%`,
      easing: "spring(1, 80, 10, 0)",
      duration: 800,
    });

    showToast(t("pages:landing.toastMark", { number: next }));

    setWatched(next);

    if (next === total) {
      showToast(t("pages:landing.toastCongrats"));
    }

    setTimeout(() => setIsAnimating(false), 1000);
  };

  function showToast(message: string) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "bg-primary/20 border-border p-3 rounded-lg text-white flex items-center gap-2 mt-2";
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    animate(toast, {
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 400,
    });

    setTimeout(() => {
      animate(toast, {
        opacity: 0,
        translateX: 20,
        duration: 400,
      });
    }, 3000);
  }

  return (
    <>
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-6 demo-text opacity-0">
            <div className="size-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xl mb-4">
              <Icon icon={"lucide:wand"} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{t("pages:landing.demoTitle")}</h2>
            <p className="text-muted-foreground text-lg">{t("pages:landing.demoDescription")}</p>
            <ul className="space-y-3 text-muted-foreground">
              {[
                t("pages:landing.crossDevice"),
                t("pages:landing.notifications"),
                t("pages:landing.progress"),
                t("pages:landing.lists"),
                t("pages:landing.favorites"),
                t("pages:landing.feed"),
                t("pages:landing.upload"),
                t("pages:landing.related"),
                t("pages:landing.hideContent"),
                t("pages:landing.cleanLayout"),
                t("pages:landing.settings"),
              ].map((benefit) => (
                <li className="flex items-center gap-3" key={benefit}>
                  <Icon icon={"lucide:check"} className="text-green-500" /> {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-1/2 w-full demo-ui opacity-0 sm:translate-x-7.5">
            <div className="max-w-md mx-auto bg-card border border-border rounded-xl overflow-hidden shadow-2xl relative">
              <div className="h-40 bg-linear-to-r from-muted/50 to-muted relative p-6 flex flex-col justify-end">
                <div className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/pjBUCUZ6dZgapy2SRoPw0WFEzrf.jpg')] bg-cover opacity-70 mix-blend-overlay"></div>
                <span className="relative z-10 bg-primary text-black text-xs px-2 py-1 rounded w-fit mb-2">
                  {t("pages:landing.watchingNow")}
                </span>
                <h3 className="relative z-10 text-2xl font-bold text-white">Game of Thrones</h3>
                <p className="relative z-10 text-gray-300 text-sm">
                  {t("library:season")} 8 • {t("library:episode")} {watched === 4 ? 5 : 6}
                </p>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("pages:landing.seasonProgress")}</span>
                  <span className="text-sm font-mono font-bold" id="progress-text">
                    {watched}/{total} {t("library:episode_other")}
                  </span>
                </div>

                <div className="h-4 w-full bg-gray-300 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-secondary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${watched * (100 / total)}%` }}
                  ></div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    onClick={() => {
                      handleTrack();
                    }}
                    disabled={watched === total}
                    className="w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group"
                  >
                    <Icon icon={"lucide:plus"} className="transition-transform group-hover:rotate-90" />
                    {watched === 6
                      ? t("library:statusAir.finished")
                      : t("pages:landing.markEpisode", { number: watched + 1 })}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="toast-container"></div>
    </>
  );
}
