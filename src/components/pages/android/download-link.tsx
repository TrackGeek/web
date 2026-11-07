import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { ANDROID_DOWNLOAD_URL } from "@/constants/android";

export function DownloadLink() {
  const { t } = useTranslation();
  return (
    <a
      className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-base leading-6 font-semibold whitespace-nowrap text-android-ink no-underline transition-[background-color,transform] duration-160 hover:bg-secondary active:translate-y-0.5 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 aria-busy:cursor-progress motion-reduce:transition-none [&_svg]:size-5"
      href={ANDROID_DOWNLOAD_URL}
    >
      <Icon icon="lucide:download" aria-hidden="true" />
      {t("pages:android.download")}
    </a>
  );
}
