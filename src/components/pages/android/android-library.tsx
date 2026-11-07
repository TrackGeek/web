import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { AppScreenshot } from "./app-screenshot";

export function AndroidLibrary() {
  const { t } = useTranslation();
  const media = [
    { type: "game", icon: "gamepad-2" },
    { type: "anime", icon: "tv" },
    { type: "movie", icon: "clapperboard" },
    { type: "tv", icon: "monitor-play" },
    { type: "book", icon: "book-open" },
    { type: "manga", icon: "library-big" },
  ];
  return (
    <section
      id="explore"
      className="mx-auto w-[calc(100%-96px)] max-w-296 max-[700px]:w-[calc(100%-40px)] grid grid-cols-2 max-[800px]:grid-cols-1 gap-16 max-[1050px]:gap-10 items-center py-28 max-[800px]:py-18"
      aria-labelledby="android-library-title"
    >
      <div className="[&>p]:max-w-107.5 max-[800px]:[&>p]:max-w-none">
        <h2
          id="android-library-title"
          className="min-w-0 text-[clamp(2.25rem,4vw,3.75rem)] leading-[1.06] font-extrabold tracking-[-0.035em] text-balance wrap-break-word"
        >
          {t("pages:android.libraryTitle")}
        </h2>
        <p>{t("pages:android.libraryDescription")}</p>
        <ul className="mt-8 mb-10 grid list-none grid-cols-2 gap-x-6 gap-y-5 p-0 [&_li]:flex [&_li]:items-center [&_li]:gap-3 [&_svg]:size-5">
          {media.map(({ type, icon }) => (
            <li key={type}>
              <Icon icon={`lucide:${icon}`} aria-hidden="true" />
              {t(`common:types.${type}_other`)}
            </li>
          ))}
        </ul>
        <div className="border-t border-android-rule pt-7 [&_p]:mt-3">
          <h3 className="min-w-0 text-[1.4rem] leading-tight font-extrabold tracking-tight text-balance wrap-break-word">
            {t("pages:android.feedTitle")}
          </h3>
          <p>{t("pages:android.feedDescription")}</p>
        </div>
      </div>
      <div className="flex items-center justify-center rounded-4xl bg-android-cream p-10">
        <AppScreenshot screen="feed" className="w-60 rotate-5 max-[800px]:w-55" />
      </div>
    </section>
  );
}
