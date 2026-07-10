import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StatusButtonConfig {
  label: string;
  icon: string;
  hoverBorder: string;
  hoverBg: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  activeClass?: string;
}

interface QuickStatusButtonsProps {
  buttons: [StatusButtonConfig, StatusButtonConfig, StatusButtonConfig];
}

export function QuickStatusButtons({ buttons }: QuickStatusButtonsProps) {
  return (
    <div className="grid grid-cols-3 w-full gap-4">
      {buttons.map((btn) => (
        <Button
          key={btn.label}
          disabled={btn.disabled}
          onClick={btn.onClick}
          className={cn(
            "size-full flex flex-col items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 bg-card disabled:opacity-50",
            btn.hoverBorder,
            btn.hoverBg,
            btn.isActive ? (btn.activeClass ?? "border-primary bg-primary/20") : "border-border",
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className={`size-10 rounded-full ${btn.iconBg} flex items-center justify-center border ${btn.iconBorder}`}
            >
              <Icon icon={btn.icon} className={`size-6 ${btn.iconColor}`} />
            </div>
            <p className="font-medium text-card-foreground text-center text-base">{btn.label}</p>
          </div>
        </Button>
      ))}
    </div>
  );
}
