import { Icon } from "@iconify/react";
import * as React from "react";
import { cn } from "@/lib/utils";

type RatingIconProps = {
  className?: string;
};

type RatingIconComponent = React.ComponentType<RatingIconProps>;

interface RatingGroupAdvancedProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange"> {
  value?: string;
  onValueChange?: (value: string) => void;
  max?: number;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "star" | "heart";
  allowHalf?: boolean;
  emptyIcon?: RatingIconComponent;
  filledIcon?: RatingIconComponent;
  colors?: {
    filled?: string;
    empty?: string;
    hover?: string;
  };
  allowClear?: boolean;
}

const defaultColors = {
  filled: "fill-yellow-400 text-yellow-400",
  empty: "text-muted-foreground/50",
  hover: "text-yellow-300",
};

const iconVariants: Record<NonNullable<RatingGroupAdvancedProps["variant"]>, RatingIconComponent> = {
  star: ({ className }) => <Icon icon="lucide:star" className={className} />,
  heart: ({ className }) => <Icon icon="lucide:heart" className={className} />,
};

function RatingGroupAdvanced({
  value = "0",
  onValueChange,
  max = 5,
  className,
  disabled = false,
  readOnly = false,
  size = "default",
  variant = "star",
  allowHalf = false,
  emptyIcon,
  filledIcon,
  colors = defaultColors,
  allowClear = false,
  ...props
}: RatingGroupAdvancedProps) {
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null);

  const currentValue = React.useMemo(() => parseFloat(value || "0"), [value]);
  const displayValue = hoveredValue ?? currentValue;

  const EmptyIcon = emptyIcon || iconVariants[variant];
  const FilledIcon = filledIcon || iconVariants[variant];

  const indices = React.useMemo(() => Array.from({ length: max }, (_, i) => i + 1), [max]);

  const handleMouseEnter = React.useCallback(
    (starValue: number, isHalf?: boolean) => {
      if (!disabled && !readOnly) {
        const finalValue = allowHalf && isHalf ? starValue - 0.5 : starValue;
        setHoveredValue(finalValue);
      }
    },
    [disabled, readOnly, allowHalf],
  );

  const handleMouseLeave = React.useCallback(() => {
    setHoveredValue(null);
  }, []);

  const handleClick = React.useCallback(
    (starValue: number, isHalf?: boolean) => {
      if (!disabled && !readOnly && onValueChange) {
        const finalValue = allowHalf && isHalf ? starValue - 0.5 : starValue;
        const newValue = allowClear && currentValue === finalValue ? "0" : finalValue.toString();
        onValueChange(newValue);
      }
    },
    [disabled, readOnly, onValueChange, allowHalf, allowClear, currentValue],
  );

  const getFillPercent = (index: number) => {
    const value = displayValue;
    if (value >= index) return 100;
    if (allowHalf && value >= index - 0.5) return 50;
    return 0;
  };

  const sizeClasses = {
    sm: "size-4",
    default: "size-5",
    lg: "size-6",
  };

  const interactive = !disabled && !readOnly;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover preview reset only, zones are focusable buttons
    <div {...props} className={cn("flex w-fit items-center", className)} onMouseLeave={handleMouseLeave}>
      {indices.map((index) => {
        const fillPercent = getFillPercent(index);

        return (
          <div key={index} className={cn("relative", disabled && "opacity-50")}>
            {/* Single stable structure: empty base + filled overlay clipped by width. */}
            <EmptyIcon className={cn(sizeClasses[size], colors.empty)} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
              <FilledIcon className={cn(sizeClasses[size], colors.filled)} />
            </div>

            {/* Hover/click zones layered on top. */}
            {interactive &&
              (allowHalf ? (
                <>
                  <button
                    type="button"
                    aria-label={`${index - 0.5} rating`}
                    className="absolute inset-y-0 left-0 w-1/2 z-10 cursor-pointer"
                    onMouseEnter={() => handleMouseEnter(index, true)}
                    onClick={() => handleClick(index, true)}
                  />
                  <button
                    type="button"
                    aria-label={`${index} rating`}
                    className="absolute inset-y-0 right-0 w-1/2 z-10 cursor-pointer"
                    onMouseEnter={() => handleMouseEnter(index, false)}
                    onClick={() => handleClick(index, false)}
                  />
                </>
              ) : (
                <button
                  type="button"
                  aria-label={`${index} rating`}
                  className="absolute inset-0 z-10 cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onClick={() => handleClick(index)}
                />
              ))}
          </div>
        );
      })}
    </div>
  );
}

export { RatingGroupAdvanced };
