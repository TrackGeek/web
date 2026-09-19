import { animate, round } from "animejs";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { prefersReducedMotion, useReveal } from "@/hooks/reveal";

type Stat = {
  target: number;
  decimals: number;
  suffix: string;
  label: string;
};

export function Counter() {
  const { t } = useTranslation();
  const sectionRef = useReveal<HTMLElement>({ selector: "[data-reveal]", y: 24, step: 110, duration: 800 });
  const countersRef = useRef<HTMLDivElement>(null);

  const stats: Stat[] = [
    { target: 350, decimals: 0, suffix: "k+", label: t("common:types.game_other") },
    { target: 1.1, decimals: 1, suffix: "M+", label: t("common:types.movie_other") },
    { target: 214, decimals: 0, suffix: "k+", label: t("common:types.tv_other") },
    { target: 1.6, decimals: 1, suffix: "M+", label: t("common:types.book_other") },
  ];

  useEffect(() => {
    const root = countersRef.current;

    if (!root) return;

    const counters = Array.from(root.querySelectorAll<HTMLElement>("[data-target]"));

    const settle = () => {
      for (const counter of counters) {
        const decimals = Number(counter.dataset.decimals ?? 0);

        counter.textContent = Number(counter.dataset.target ?? 0).toFixed(decimals);
      }
    };

    if (prefersReducedMotion()) {
      settle();

      return;
    }

    for (const counter of counters) {
      counter.textContent = "0";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        observer.disconnect();

        for (const counter of counters) {
          const decimals = Number(counter.dataset.decimals ?? 0);

          animate(counter, {
            innerHTML: [0, Number(counter.dataset.target ?? 0)],
            duration: 2200,
            ease: "outExpo",
            modifier: round(decimals),
          });
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative border-y border-border/50 bg-secondary/[0.06] py-20">
      <div className="container mx-auto px-4">
        <p data-reveal className="anim-hidden mx-auto mb-12 max-w-xl text-center text-muted-foreground text-balance">
          {t("pages:landing.catalogLead")}
        </p>

        <div ref={countersRef} className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} data-reveal className="anim-hidden group">
              <div className="mb-3 text-4xl font-bold tracking-tight tabular-nums transition-colors duration-300 group-hover:text-primary md:text-5xl">
                <span data-target={stat.target} data-decimals={stat.decimals}>
                  {stat.target.toFixed(stat.decimals)}
                </span>
                {stat.suffix}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="mx-auto mt-4 h-px w-8 bg-border transition-all duration-300 group-hover:w-16 group-hover:bg-primary" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
