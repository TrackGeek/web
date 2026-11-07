import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

export function AndroidInstances() {
  const { t } = useTranslation();
  return (
    <section className="bg-android-cream py-22 max-[800px]:py-16" aria-labelledby="android-instances-title">
      <div className="mx-auto w-[calc(100%-96px)] max-w-296 max-[700px]:w-[calc(100%-40px)] grid grid-cols-2 max-[800px]:grid-cols-1 gap-16 max-[1050px]:gap-10 items-center">
        <div>
          <h2
            id="android-instances-title"
            className="min-w-0 text-[clamp(2.25rem,4vw,3.75rem)] leading-[1.06] font-extrabold tracking-[-0.035em] text-balance wrap-break-word"
          >
            {t("pages:android.instanceTitle")}
          </h2>
          <p>{t("pages:android.instanceDescription")}</p>
        </div>
        <div className="border-l border-android-rule pl-7 max-[800px]:border-l-0 max-[800px]:pl-0 [&>p]:mb-4 [&>p]:text-sm [&>div]:flex [&>div]:gap-4 [&>div]:border-b [&>div]:border-android-rule [&>div]:py-6 [&>div]:text-lg [&_svg]:size-6 [&_svg]:shrink-0 [&_span]:flex-1">
          <p>{t("pages:android.instanceChoice")}</p>
          <div>
            <Icon icon="lucide:globe" aria-hidden="true" />
            <span>{t("pages:android.instanceDefault")}</span>
            <Icon icon="lucide:check" aria-hidden="true" />
          </div>
          <div>
            <Icon icon="lucide:server" aria-hidden="true" />
            <span>{t("pages:android.instanceCustom")}</span>
            <Icon icon="lucide:check" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
