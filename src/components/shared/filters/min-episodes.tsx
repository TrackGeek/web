import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input.tsx";

export function MinEpisodes() {
  const { t } = useTranslation();

  return (
    <div>
      <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:episode_other")}</h5>
      <Input type="number" placeholder={t("common:minEpisodes")} min={0} className="bg-muted/50" />
    </div>
  );
}
