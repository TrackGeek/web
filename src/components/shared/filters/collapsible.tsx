import { Icon } from "@iconify/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface CollapsibleFiltersProps {
  activeCount: number;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  onClear?: () => void;
}

export function CollapsibleFilters({
  activeCount,
  children,
  className,
  headerClassName,
  onClear,
}: CollapsibleFiltersProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-col gap-2 md:gap-4", className)}>
      <div className={cn("flex items-center gap-2", headerClassName)}>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="flex flex-1 min-w-0 items-center gap-2 rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm font-semibold text-card-foreground transition-colors cursor-pointer hover:bg-muted md:border-0 md:bg-transparent md:p-0 md:pointer-events-none md:hover:bg-transparent"
        >
          <Icon icon="lucide:sliders-horizontal" className="size-4 shrink-0 md:hidden" />
          <span className="flex-1 text-left truncate">{t("user:filter")}</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
              {activeCount}
            </span>
          )}
          <Icon
            icon="lucide:chevron-down"
            className={cn("size-4 shrink-0 transition-transform md:hidden", open && "rotate-180")}
          />
        </button>

        {activeCount > 0 && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors cursor-pointer hover:text-primary"
          >
            <Icon icon="lucide:x" className="size-3" aria-hidden="true" />
            {t("common:clear")}
          </button>
        )}
      </div>

      <div
        className={cn(
          "max-md:grid transition-[grid-template-rows] duration-300 ease-out md:grid-rows-[1fr]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div
          className={cn(
            "overflow-hidden transition-[visibility] duration-300 md:visible md:overflow-visible flex flex-col gap-y-2",
            open ? "visible" : "invisible",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
