import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ListWithMore({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="truncate">{items[0]}</span>
      {items.length > 1 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="shrink-0 cursor-default rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
              +{items.length - 1}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <ul className="flex flex-col gap-0.5">
              {items.slice(1).map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
