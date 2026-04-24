import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ComparisonSupport } from "@/lib/comparison.config";

interface ComparisonCellProps {
  support: ComparisonSupport;
  note?: string;
}

export function ComparisonCell({ support, note }: ComparisonCellProps) {
  const { t } = useTranslation();

  if (support === "yes") {
    return (
      <Icon icon={"lucide:check"} className="size-4 text-emerald-500" aria-label={t("pages:compare.support.yes")} />
    );
  }

  if (support === "no") {
    return <Icon icon={"lucide:x"} className="size-4 text-rose-500" aria-label={t("pages:compare.support.no")} />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex cursor-help items-center gap-1 text-amber-400"
            aria-label={t("pages:compare.support.partial")}
          >
            <Icon icon={"lucide:alert-triangle"} className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-48 text-center">
          {note ? t(note, { defaultValue: note }) : t("pages:compare.support.partialDescription")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
