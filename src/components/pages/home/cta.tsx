import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/reveal";
import { useSession } from "@/lib/auth/client";
import { openAuthModal } from "@/lib/auth/modal";

export function CTA() {
  const { t } = useTranslation();
  const session = useSession();
  const username = session.data?.user?.username;
  const revealRef = useReveal<HTMLElement>({ y: 30, scale: 0.96, step: 90, duration: 950 });

  const buttonClass =
    "tg-sheen h-12 w-full gap-2 rounded-lg px-8 text-base font-semibold shadow-xl shadow-primary/25 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto sm:text-lg";

  return (
    <section ref={revealRef} className="relative overflow-hidden px-4 py-28 text-center">
      <div className="tg-aurora pointer-events-none absolute inset-x-0 -bottom-64 h-[640px] rotate-180" aria-hidden />
      <div className="tg-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <div className="relative mx-auto max-w-2xl space-y-6">
        <h2 data-reveal className="anim-hidden text-3xl font-bold tracking-tight text-balance md:text-5xl">
          {t("pages:landing.CTATitle")}
        </h2>

        <p data-reveal className="anim-hidden text-lg text-muted-foreground text-balance">
          {t("pages:landing.CTADescription")}
        </p>

        <div data-reveal className="anim-hidden flex justify-center pt-4">
          {username ? (
            <Link to="/user/$username" params={{ username }} search={{ tab: "overview" }} className="w-full sm:w-auto">
              <Button className={buttonClass}>
                {t("pages:landing.CTAButton")}
                <Icon icon="lucide:arrow-right" />
              </Button>
            </Link>
          ) : (
            <Button onClick={() => openAuthModal("register")} className={buttonClass}>
              {t("pages:landing.CTAButton")}
              <Icon icon="lucide:arrow-right" />
            </Button>
          )}
        </div>

        <p data-reveal className="anim-hidden text-sm text-muted-foreground text-balance">
          {t("pages:landing.CTAReassurance")}
        </p>
      </div>
    </section>
  );
}
