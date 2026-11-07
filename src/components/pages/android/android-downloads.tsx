import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { ANDROID_SOURCE_URL } from "@/constants/android";
import { DownloadLink } from "./download-link";

export function AndroidDownloads() {
  const { t } = useTranslation();
  return (
    <section
      id="download"
      className="mx-auto w-[calc(100%-96px)] max-w-296 max-[700px]:w-[calc(100%-40px)] grid grid-cols-2 max-[800px]:grid-cols-1 gap-16 max-[1050px]:gap-10 border-b border-android-rule py-22 max-[800px]:gap-7 max-[800px]:py-16"
      aria-labelledby="android-download-title"
    >
      <div className="[&>svg]:mb-5 [&>svg]:size-8">
        <Icon icon="lucide:smartphone" aria-hidden="true" />
        <h2
          id="android-download-title"
          className="min-w-0 max-w-110 text-[clamp(2rem,3vw,2.75rem)] leading-[1.06] font-extrabold tracking-[-0.035em] text-balance wrap-break-word"
        >
          {t("pages:android.downloadTitle")}
        </h2>
      </div>
      <div>
        <p>{t("pages:android.downloadDescription")}</p>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <DownloadLink />
          <a
            className="inline-flex min-h-12 items-center text-[0.9375rem] font-semibold underline hover:decoration-2 active:opacity-75"
            href={ANDROID_SOURCE_URL}
          >
            {t("pages:android.source")}
          </a>
        </div>
        <p className="mt-5 max-w-122.5 text-sm">{t("pages:android.installNote")}</p>
      </div>
    </section>
  );
}
