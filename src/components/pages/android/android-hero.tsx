import { useTranslation } from "react-i18next";
import { AppScreenshot } from "./app-screenshot";
import { DownloadLink } from "./download-link";

export function AndroidHero() {
  const { t } = useTranslation();
  return (
    <section
      className="rounded-b-[56px] bg-linear-[175deg,var(--color-android-paper)_30%,var(--color-android-mint)_100%] pt-16 pb-13 max-[800px]:rounded-b-4xl max-[800px]:pt-14 max-[800px]:pb-10"
      aria-labelledby="android-title"
    >
      <div className="mx-auto w-[calc(100%-96px)] max-w-296 max-[700px]:w-[calc(100%-40px)] grid min-h-[calc(100svh-172px)] grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] items-center gap-16 max-[1050px]:gap-10 max-[800px]:min-h-0 max-[800px]:grid-cols-1 max-[800px]:gap-2">
        <div className="pb-8 max-[800px]:max-w-155 max-[800px]:p-0">
          <h1
            id="android-title"
            className="min-w-0 text-[clamp(3.4rem,6.5vw,6rem)] leading-[1.02] font-extrabold tracking-[-0.045em] text-balance wrap-break-word max-[1050px]:text-[4rem] max-[800px]:max-w-140 max-[800px]:text-[clamp(2.75rem,8vw,4rem)]"
          >
            {t("pages:android.heroTitle")}
          </h1>
          <p className="mt-7 max-w-92.5 text-lg max-[800px]:max-w-112.5">{t("pages:android.heroDescription")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <DownloadLink />
            <a
              className="inline-flex min-h-12 items-center text-[0.9375rem] font-semibold underline hover:decoration-2 active:opacity-75"
              href="#explore"
            >
              {t("pages:android.explore")}
            </a>
          </div>
        </div>
        <div className="relative min-h-137.5 max-[1050px]:min-h-122.5 max-[800px]:mx-auto max-[800px]:mt-9 max-[800px]:min-h-120 max-[800px]:w-full max-[800px]:max-w-107.5 max-[370px]:min-h-102.5">
          <AppScreenshot
            screen="game"
            className="absolute top-0 left-0 w-57 -rotate-8 max-[1050px]:w-49 max-[800px]:left-4 max-[800px]:w-48.75 max-[370px]:left-1.25 max-[370px]:w-41.5"
            priority
          />
          <AppScreenshot
            screen="book"
            className="absolute top-7.5 right-7 w-59.5 rotate-7 max-[1050px]:w-51.5 max-[800px]:top-3 max-[800px]:right-4 max-[800px]:w-51.25 max-[370px]:right-1.25 max-[370px]:w-44"
            priority
          />
        </div>
      </div>
    </section>
  );
}
