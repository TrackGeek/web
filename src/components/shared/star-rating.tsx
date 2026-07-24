import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  className?: string;
  starClassName?: string;
}

export function StarRating({ value, max = 5, className, starClassName }: StarRatingProps) {
  const percentage = Math.max(0, Math.min(1, value / max)) * 100;

  return (
    <div className={cn("relative inline-flex", className)}>
      <div className="flex">
        {Array.from({ length: max }).map((_, index) => (
          <Icon
            key={index}
            icon={"material-symbols:star-rounded"}
            className={cn("size-5 shrink-0 text-primary-foreground", starClassName)}
          />
        ))}
      </div>
      <div className="absolute top-0 left-0 flex overflow-hidden" style={{ width: `${percentage}%` }}>
        {Array.from({ length: max }).map((_, index) => (
          <Icon
            key={index}
            icon={"material-symbols:star-rounded"}
            className={cn("size-5 shrink-0 text-yellow-400 fill-yellow-400", starClassName)}
          />
        ))}
      </div>
    </div>
  );
}
