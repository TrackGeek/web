import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { AppScreenshot } from "./app-screenshot";

export function AndroidExperience() {
  const { t } = useTranslation();
  return (
    <section
      className="mx-auto w-[calc(100%-96px)] max-w-296 max-[700px]:w-[calc(100%-40px)] grid grid-cols-2 max-[800px]:grid-cols-1 gap-16 max-[1050px]:gap-10 items-center pt-6 pb-28 max-[800px]:pt-0 max-[800px]:pb-18"
      aria-labelledby="android-search-title"
    >
      <div className="flex items-center justify-center rounded-4xl bg-android-mint p-10 max-[800px]:order-2">
        <AppScreenshot screen="search" className="w-62.5 -rotate-4 max-[800px]:w-55" />
      </div>
      <div>
        <h2
          id="android-search-title"
          className="min-w-0 text-[clamp(2.25rem,4vw,3.75rem)] leading-[1.06] font-extrabold tracking-[-0.035em] text-balance wrap-break-word"
        >
          {t("pages:android.searchTitle")}
        </h2>
        <p>{t("pages:android.searchDescription")}</p>
        <dl className="mt-9">
          {["design", "notifications"].map((feature) => (
            <div key={feature} className="border-t border-android-rule py-6">
              <dt className="flex items-center gap-3 text-lg font-semibold [&_svg]:size-6 [&_svg]:shrink-0">
                <Icon icon={feature === "design" ? "lucide:layout-template" : "lucide:bell-ring"} aria-hidden="true" />
                {t(`pages:android.${feature}Title`)}
              </dt>
              <dd className="mt-3">{t(`pages:android.${feature}Description`, { version: 3 })}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
