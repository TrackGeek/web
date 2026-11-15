import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { RewindMotif } from "@/components/rewind/rewind-motif";
import { REWIND_YEAR } from "@/constants/rewind";

export function RewindPromo() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      const now = new Date();
      setVisible(now.getFullYear() === REWIND_YEAR && now.getMonth() === 11);
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(update, tomorrow.getTime() - now.getTime());
    };
    update();
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <Link
      to="/replay/2026"
      className="group relative isolate block overflow-clip rounded-xl bg-secondary-foreground p-6 font-replay text-replay-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <RewindMotif className="pointer-events-none absolute -top-8 -right-24 -z-10 w-80 -rotate-12 text-secondary opacity-30 transition-transform duration-500 group-hover:translate-x-2 motion-reduce:transition-none motion-reduce:transform-none" />
      <h2 className="min-w-0 text-5xl leading-none font-black wrap-break-word font-stretch-72%">
        <Trans
          i18nKey="rewind:hero.title"
          values={{ year: REWIND_YEAR }}
          components={{ year: <span className="block text-7xl" /> }}
        />
      </h2>
      <p className="mt-4 max-w-[26ch] text-sm leading-relaxed">{t("rewind:hero.description")}</p>
      <span className="mt-6 inline-flex min-h-11 items-center rounded-full bg-replay-ink px-5 text-sm font-bold transition-transform group-hover:scale-[1.03] motion-reduce:transform-none">
        {t("rewind:hero.start")}
      </span>
    </Link>
  );
}
