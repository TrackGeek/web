import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { createTimeline, stagger } from "animejs";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useGithubStars } from "@/hooks/github";
import { prefersReducedMotion, usePointerParallax } from "@/hooks/reveal";
import { useSession } from "@/lib/auth/client";
import { openAuthModal } from "@/lib/auth/modal";
import { cn } from "@/lib/utils";

type TrackCardProps = {
  icon: string;
  tone: string;
  title: string;
  meta: ReactNode;
  children: ReactNode;
  rotate?: number;
  className?: string;
};

function TrackCard({ icon, tone, title, meta, children, rotate, className }: TrackCardProps) {
  return (
    <div
      data-rotate={rotate}
      className={cn(
        "hero-card anim-hidden w-full rounded-xl border border-border/60 bg-card/80 p-4 shadow-2xl backdrop-blur-sm",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", tone)}>
          <Icon icon={icon} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{title}</div>
          <div className="truncate text-xs text-muted-foreground">{meta}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

export function Hero() {
  const { t } = useTranslation();
  const session = useSession();
  const username = session.data?.user?.username;
  const { data: stars } = useGithubStars();
  const parallaxRef = usePointerParallax<HTMLElement>();

  useEffect(() => {
    if (prefersReducedMotion()) {
      for (const el of document.querySelectorAll<HTMLElement>(
        ".hero-badge, .hero-line, .hero-cta, .hero-proof, .hero-card",
      )) {
        el.style.opacity = "1";
      }

      return;
    }

    const timeline = createTimeline({ defaults: { ease: "outExpo", duration: 900 } });

    timeline
      .add(".hero-badge", { opacity: [0, 1], translateY: [16, 0], duration: 600 })
      .add(".hero-line", { opacity: [0, 1], translateY: [44, 0], delay: stagger(120), duration: 1100 }, "-=380")
      .add(".hero-cta", { opacity: [0, 1], translateY: [22, 0], delay: stagger(90) }, "-=700")
      .add(".hero-proof", { opacity: [0, 1], translateY: [12, 0], delay: stagger(70), duration: 700 }, "-=600")
      .add(
        ".hero-card",
        {
          opacity: [0, 1],
          scale: [0.86, 1],
          rotate: (target: HTMLElement) => Number(target.dataset.rotate ?? 0),
          delay: stagger(170),
          duration: 1200,
          ease: "outBack(1.2)",
        },
        "-=1000",
      );

    return () => timeline.revert();
  }, []);

  const cards = [
    <TrackCard
      key="anime"
      icon="lucide:ghost"
      tone="bg-purple-500/20 text-purple-400"
      title="Jujutsu Kaisen"
      rotate={-6}
      meta={`${t("common:types.anime")} • ${t("library:episode")} 24`}
    >
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[90%] rounded-full bg-purple-500" />
      </div>
    </TrackCard>,
    <TrackCard
      key="game"
      icon="lucide:gamepad"
      tone="bg-blue-500/20 text-blue-400"
      title="Elden Ring"
      rotate={4}
      meta={`${t("common:types.game")} • 120h ${t("feed:lists.played")}`}
    >
      <div className="flex gap-1">
        {[true, true, true, false, false].map((filled, index) => (
          <div key={index} className={cn("h-1.5 flex-1 rounded-sm", filled ? "bg-blue-500" : "bg-blue-500/25")} />
        ))}
      </div>
    </TrackCard>,
    <TrackCard
      key="book"
      icon="lucide:book"
      tone="bg-yellow-500/20 text-yellow-400"
      title="Dune"
      rotate={-3}
      meta={`${t("common:types.book")} • ${t("library:page")} 412/890`}
    >
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[46.29%] rounded-full bg-yellow-500" />
      </div>
    </TrackCard>,
  ];

  const proofs = [
    { icon: "lucide:git-branch", label: t("pages:landing.proofOpenSource") },
    { icon: "lucide:server", label: t("pages:landing.proofSelfHost") },
    { icon: "lucide:gift", label: t("pages:landing.proofFree") },
    { icon: "lucide:shield-check", label: t("pages:landing.proofNoAds") },
  ];

  return (
    <section ref={parallaxRef} className="relative overflow-hidden pt-24 pb-20 lg:pb-28">
      <div className="tg-aurora pointer-events-none absolute inset-x-0 -top-40 h-[720px] opacity-70" aria-hidden />
      <div className="tg-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />

      <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
        <div data-depth="26" className="absolute top-[12%] left-[7%] w-64 will-change-transform">
          <div className="tg-float" style={{ animationDelay: "0ms" }}>
            {cards[0]}
          </div>
        </div>
        <div data-depth="-34" className="absolute top-[18%] right-[7%] w-64 will-change-transform">
          <div className="tg-float" style={{ animationDelay: "900ms" }}>
            {cards[1]}
          </div>
        </div>
        <div data-depth="18" className="absolute bottom-[6%] left-[17%] w-64 will-change-transform">
          <div className="tg-float" style={{ animationDelay: "1800ms" }}>
            {cards[2]}
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="hero-badge anim-hidden mb-8 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          {t("pages:landing.alive")}
        </div>

        <h1 className="hero-line anim-hidden mx-auto mb-6 max-w-4xl text-4xl font-bold tracking-tight text-balance [overflow-wrap:anywhere] md:text-6xl lg:text-7xl">
          <Trans
            i18nKey="pages:landing.heroTitle"
            components={{
              1: (
                <span className="bg-gradient-to-br from-malachite-300 via-primary to-malachite-600 bg-clip-text text-transparent">
                  Geek Journey
                </span>
              ),
            }}
          />
        </h1>

        <p className="hero-line anim-hidden mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {t("pages:landing.heroDescription")}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <div className="hero-cta anim-hidden w-full sm:w-auto">
            {username ? (
              <Link to="/user/$username" params={{ username }} search={{ tab: "overview" }} className="block">
                <Button className="tg-sheen h-12 w-full rounded-lg px-6 text-base sm:px-8 font-semibold shadow-lg shadow-primary/25 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto">
                  {t("pages:landing.CTAButton")}
                  <Icon icon="lucide:arrow-right" />
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => openAuthModal("register")}
                className="tg-sheen h-12 w-full rounded-lg px-6 text-base sm:px-8 font-semibold shadow-lg shadow-primary/25 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
              >
                {t("pages:landing.CTAButton")}
                <Icon icon="lucide:arrow-right" />
              </Button>
            )}
          </div>

          <div className="hero-cta anim-hidden w-full sm:w-auto">
            <a
              href="https://github.com/TrackGeek/"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              title={typeof stars === "number" ? t("pages:landing.githubStars", { count: stars }) : undefined}
            >
              <Button
                variant="outline"
                className="h-12 w-full rounded-lg px-6 text-base sm:px-8 font-medium transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
              >
                <Icon icon="lucide:github" />
                {t("pages:landing.heroButton")}
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

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {proofs.map((proof) => (
            <li
              key={proof.label}
              className="hero-proof anim-hidden flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Icon icon={proof.icon} className="size-4 text-primary" />
              {proof.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
