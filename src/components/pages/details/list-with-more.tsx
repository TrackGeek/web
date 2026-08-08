import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface ListWithMoreEntry {
  key: string;
  label: ReactNode;
}

function normalize(item: string | ListWithMoreEntry): ListWithMoreEntry {
  return typeof item === "string" ? { key: item, label: item } : item;
}

export function ListWithMore({ items }: { items: (string | ListWithMoreEntry)[] }) {
  if (items.length === 0) return null;

  const entries = items.map(normalize);

  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="truncate">{entries[0].label}</span>
      {entries.length > 1 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="shrink-0 cursor-default rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
              +{entries.length - 1}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <ul className="flex flex-col gap-0.5">
              {entries.slice(1).map((entry) => (
                <li key={entry.key}>{entry.label}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
