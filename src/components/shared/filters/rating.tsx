import { useTranslation } from "react-i18next";
import { Slider } from "@/components/ui/slider.tsx";

interface RatingProps {
  value?: number;
  onChange?: (value: number | undefined) => void;
}

export function Rating({ value, onChange }: RatingProps) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <h5 className="text-md font-semibold text-card-foreground">{t("library:tgRating")}</h5>
        <span className="text-sm text-muted-foreground tabular-nums">
          {value != null ? `≥ ${value.toFixed(1)}` : t("common:all")}
        </span>
      </div>
      <Slider
        min={0}
        max={5}
        step={0.5}
        value={[value ?? 0]}
        onValueChange={([next]) => onChange?.(next === 0 ? undefined : next)}
      />
    </div>
  );
}
