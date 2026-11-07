import { useTranslation } from "react-i18next";
import { AppScreenshot } from "./app-screenshot";
import { DownloadLink } from "./download-link";

export function AndroidClose() {
  const { t } = useTranslation();
  return (
    <section
      className="mx-auto w-[calc(100%-96px)] max-w-296 max-[700px]:w-[calc(100%-40px)] mb-18 grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center gap-16 max-[1050px]:gap-10 overflow-clip rounded-4xl bg-android-mint px-16 pt-14 max-[800px]:mb-10 max-[800px]:grid-cols-1 max-[800px]:gap-4 max-[800px]:px-7 max-[800px]:pt-9"
      aria-labelledby="android-close-title"
    >
      <div>
        <h2
          id="android-close-title"
          className="min-w-0 text-[clamp(2.25rem,4vw,3.75rem)] leading-[1.06] font-extrabold tracking-[-0.035em] text-balance wrap-break-word max-w-135"
        >
          {t("pages:android.closeTitle")}
        </h2>
        <p className="mt-6">{t("pages:android.closeDescription")}</p>
        <div className="mt-7 mb-14 max-[800px]:mb-3">
          <DownloadLink />
        </div>
      </div>
      <div className="h-92.5 self-end pt-6 max-[800px]:h-60">
        <AppScreenshot screen="movie" className="mx-auto w-60 rotate-7" />
      </div>
    </section>
  );
}
