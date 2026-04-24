import type { ComparisonPlatform } from "@/lib/comparison.config";

interface PlatformHeaderProps {
  platform: ComparisonPlatform;
}

export function PlatformHeader({ platform }: PlatformHeaderProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="font-semibold text-sm text-foreground">{platform.name}</span>
    </div>
  );
}
