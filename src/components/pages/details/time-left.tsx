import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

interface TimeLeftProps {
  hours: number | null;
}

export function TimeLeft({ hours }: TimeLeftProps) {
  const { t, i18n } = useTranslation();

  if (hours === null) return null;

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon icon="lucide:clock" className="size-5 shrink-0" aria-hidden="true" />
      <span>
        {t("library:timeLeft")}:{" "}
        {t("common:hourCount", {
          count: hours,
          formattedCount: new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(hours),
        })}
      </span>
    </div>
  );
}
