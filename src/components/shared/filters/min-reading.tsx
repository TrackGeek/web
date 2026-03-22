import { useTranslation } from "react-i18next";
import type { ContentType } from "@/components/layouts/filters.tsx";
import { Input } from "@/components/ui/input.tsx";

interface MinReadingProps {
  type: ContentType;
  value?: number;
  onChange?: (value: number | undefined) => void;
}

export function MinReading({ type, value, onChange }: MinReadingProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h5 className="text-md font-semibold text-card-foreground mb-2">
        {t(type === "manga" ? "library:chapters" : "library:page_other")}
      </h5>
      <Input
        type="number"
        placeholder={t(type === "manga" ? "common:minChapters" : "common:minPages")}
        min={0}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : undefined)}
      />
    </div>
  );
}
