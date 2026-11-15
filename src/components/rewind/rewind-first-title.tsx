import { useTranslation } from "react-i18next";
import type { PersonalRewind } from "@/types/rewind";
import { RewindMotif } from "./rewind-motif";
import { RewindTitleArt } from "./rewind-title-art";

export function RewindFirstTitle({ title }: { title: NonNullable<PersonalRewind["first"]> }) {
  const { t, i18n } = useTranslation();
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(title.recordedAt),
  );

  return (
    <div className="relative isolate flex min-h-full items-center overflow-clip bg-replay-blue text-replay-paper">
      <RewindMotif
        variant="flower"
        className="pointer-events-none absolute -left-28 -bottom-28 -z-10 size-140 text-replay-pink opacity-15"
      />
      <div className="mx-auto grid w-full max-w-360 grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] items-center gap-5 px-6 py-10 sm:gap-14 sm:px-12 lg:px-18">
        <div className="min-w-0">
          <h2 className="max-w-[12ch] text-4xl leading-none font-black text-balance sm:text-6xl lg:text-7xl">
            {t("rewind:first.title")}
          </h2>
          <p className="mt-6 text-xl leading-tight font-bold sm:text-3xl">{title.title ?? t("rewind:untitled")}</p>
          <p className="mt-4 text-sm sm:text-base">{t("rewind:first.date", { date })}</p>
        </div>
        <RewindTitleArt title={title} type={title.type} className="w-full max-w-80 justify-self-end rotate-6" />
      </div>
    </div>
  );
}
