import { useTranslation } from "react-i18next";

export function AndroidOnboarding() {
  const { t } = useTranslation();
  return (
    <section
      id="getting-started"
      className="mx-auto w-[calc(100%-96px)] max-w-296 max-[700px]:w-[calc(100%-40px)] py-28 max-[800px]:py-18"
      aria-labelledby="android-onboarding-title"
    >
      <h2
        id="android-onboarding-title"
        className="min-w-0 text-[clamp(2.25rem,4vw,3.75rem)] leading-[1.06] font-extrabold tracking-[-0.035em] text-balance wrap-break-word max-w-155"
      >
        {t("pages:android.stepsTitle")}
      </h2>
      <ol className="mt-16 grid list-none grid-cols-3 gap-16 p-0 [counter-reset:steps] max-[1050px]:gap-8 max-[800px]:mt-10 max-[800px]:grid-cols-1 max-[800px]:gap-9">
        {[{ key: "Login" }, { key: "Watch" }, { key: "Profile" }].map(({ key }) => (
          <li
            key={key}
            className="relative border-t border-android-rule pt-7 [counter-increment:steps] before:absolute before:right-0 before:text-sm before:text-android-muted before:content-[counter(steps,decimal-leading-zero)]"
          >
            <h3 className="min-w-0 text-[1.4rem] leading-tight font-extrabold tracking-tight text-balance wrap-break-word max-[800px]:pr-7">
              {t(`pages:android.step${key}Title`)}
            </h3>
            <p className="mt-4">{t(`pages:android.step${key}Description`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
