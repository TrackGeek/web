import { Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function MedalIcon({ name, description }: { name: string; description?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-full rounded-md bg-muted/30 flex items-center justify-center aspect-square">
          <Star className="w-full text-yellow-400" />
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-muted">
        <div className="max-w-xs">
          <div className="font-semibold">{name}</div>
          {description && <div className="text-xs text-muted-foreground">{description}</div>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
