import { Badge } from "@/components/ui/badge";
import type { ComparisonPlatform } from "@/lib/comparison.config";

interface PlatformHeaderProps {
  platform: ComparisonPlatform;
}

export function PlatformHeader({ platform }: PlatformHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-foreground">{platform.name}</span>
        {platform.isTrackGeek ? <Badge variant="success">You are here</Badge> : null}
      </div>
      <span className="text-xs text-muted-foreground">{platform.shortDescription}</span>
    </div>
  );
}
