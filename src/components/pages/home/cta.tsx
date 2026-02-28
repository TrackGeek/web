import { animate } from "animejs";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function CTA() {
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

          if (el.classList.contains("cta-final"))
            simple({
              opacity: [0, 1],
              scale: [0.9, 1],
              duration: 1200,
              easing: "easeOutElastic(1, .8)",
            });
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    document.querySelectorAll(".cta-final").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 text-center px-4">
      <div className="max-w-2xl mx-auto space-y-6 cta-final opacity-0 scale-90">
        <h2 className="text-3xl md:text-5xl font-bold">{t("pages:landing.CTATitle")}</h2>
        <p className="text-muted-foreground text-lg">{t("pages:landing.CTADescription")}</p>
        <div className="flex justify-center gap-4 pt-4">
          <Button className="bg-primary text-primary-foreground h-12 px-8 rounded-lg font-medium text-lg hover:scale-105 transition-transform shadow-xl shadow-primary/20">
            {t("pages:landing.CTAButton")}
          </Button>
        </div>
      </div>
    </section>
  );
}
