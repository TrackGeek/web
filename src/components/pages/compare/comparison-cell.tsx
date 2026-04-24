import { AlertTriangle, Check, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ComparisonSupport } from "@/lib/comparison.config";

interface ComparisonCellProps {
  support: ComparisonSupport;
  note?: string;
}

export function ComparisonCell({ support, note }: ComparisonCellProps) {
  if (support === "yes") {
    return <Check className="size-4 text-emerald-500" aria-label="Supported" />;
  }

  if (support === "no") {
    return <X className="size-4 text-rose-500" aria-label="Not supported" />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help items-center gap-1 text-amber-400" aria-label="Partially supported">
            <AlertTriangle className="size-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-48 text-center">
          {note ?? "Partially supported."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
