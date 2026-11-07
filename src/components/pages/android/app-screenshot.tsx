import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface AppScreenshotProps {
  screen: "profile" | "search" | "feed" | "game" | "book" | "movie";
  className?: string;
  priority?: boolean;
}

export function AppScreenshot({ screen, className = "", priority = false }: AppScreenshotProps) {
  const { t } = useTranslation();
  return (
    <img
      className={cn(
        "block h-auto w-full rounded-[28px] bg-android-screen shadow-[0_20px_50px_var(--color-android-shadow)]",
        className,
      )}
      src={`/images/android/${screen}.webp`}
      alt={t(`pages:android.${screen}Alt`)}
      width={640}
      height={1422}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
