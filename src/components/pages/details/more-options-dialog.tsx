import { Icon } from "@iconify/react";
import type { ComponentProps, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface StatusIndicator {
  labelKey: string;
  trigger: string;
  badge: string;
  dot: string;
}

const STATUS_INDICATORS: Record<string, StatusIndicator> = {
  Paused: {
    labelKey: "feed:lists.paused",
    trigger: "text-yellow-400 hover:text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20",
    badge: "border-yellow-400/40 bg-yellow-400/10 text-yellow-400",
    dot: "bg-yellow-400",
  },
  Dropped: {
    labelKey: "feed:lists.dropped",
    trigger: "text-red-400 hover:text-red-400 bg-red-400/10 hover:bg-red-400/20",
    badge: "border-red-400/40 bg-red-400/10 text-red-400",
    dot: "bg-red-400",
  },
  Replaying: {
    labelKey: "feed:lists.replaying",
    trigger: "text-blue-400 hover:text-blue-400 bg-blue-400/10 hover:bg-blue-400/20",
    badge: "border-blue-400/40 bg-blue-400/10 text-blue-400",
    dot: "bg-blue-400",
  },
  Rewatching: {
    labelKey: "feed:lists.rewatching",
    trigger: "text-blue-400 hover:text-blue-400 bg-blue-400/10 hover:bg-blue-400/20",
    badge: "border-blue-400/40 bg-blue-400/10 text-blue-400",
    dot: "bg-blue-400",
  },
  Rereading: {
    labelKey: "feed:lists.rereading",
    trigger: "text-blue-400 hover:text-blue-400 bg-blue-400/10 hover:bg-blue-400/20",
    badge: "border-blue-400/40 bg-blue-400/10 text-blue-400",
    dot: "bg-blue-400",
  },
};

interface MoreOptionsTriggerProps extends ComponentProps<typeof Button> {
  label: string;
  status?: string;
}

export function MoreOptionsTrigger({ label, status, className, ...props }: MoreOptionsTriggerProps) {
  const { t } = useTranslation();
  const indicator = status ? STATUS_INDICATORS[status] : undefined;

  return (
    <Button
      {...props}
      className={cn(
        "flex bg-transparent items-center justify-center gap-2 w-full py-3 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-all duration-300",
        indicator?.trigger,
        className,
      )}
    >
      <Icon icon="lucide:more-horizontal" className="size-5" />
      <span className="text-sm font-medium">{label}</span>
      {indicator && (
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
            indicator.badge,
          )}
        >
          <span className={cn("size-1.5 rounded-full", indicator.dot)} />
          {t(indicator.labelKey)}
        </span>
      )}
    </Button>
  );
}

interface MoreOptionsDialogProps {
  title: string;
  coverUrl: string;
  rating: number;
  subtitle: ReactNode;
  description?: string;
  triggerLabel: string;
  status?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  favoriteDisabled?: boolean;
}

export function MoreOptionsDialog({
  title,
  coverUrl,
  rating,
  subtitle,
  description,
  triggerLabel,
  status,
  children,
  open,
  onOpenChange,
  isFavorited,
  onToggleFavorite,
  favoriteDisabled,
}: MoreOptionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <MoreOptionsTrigger label={triggerLabel} status={status} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader
          className="h-40 sm:h-48 p-0 flex flex-row items-center bg-cover bg-center px-4 sm:px-6 relative"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url("${coverUrl}")`,
          }}
        >
          <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
          <div className="flex flex-row items-center w-full min-w-0">
            <img
              src={coverUrl}
              alt="Cover"
              className="w-20 h-28 sm:w-28 sm:h-40 shrink-0 object-cover rounded-lg shadow-2xl relative z-10 border-2 border-white/30"
            />
            <div className="flex-1 min-w-0 px-3 sm:px-6 relative z-10 space-y-2">
              <DialogTitle className="text-white font-bold text-lg sm:text-2xl drop-shadow-lg line-clamp-2 text-left">
                {title}
              </DialogTitle>
              <div className="flex items-center gap-2 sm:gap-4 text-white/90 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <Icon icon="lucide:star" className="size-4 fill-yellow-400 text-yellow-400" />
                  <span>{rating}</span>
                </div>
                <span>•</span>
                <span>{subtitle}</span>
              </div>
              {description && (
                <div className="hidden sm:block">
                  <p className="text-white/80 text-sm max-w-md line-clamp-2">{description}</p>
                </div>
              )}
            </div>
          </div>
          <div className="absolute z-50 right-3 sm:top-[45%] sm:right-10 flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={favoriteDisabled}
              onClick={onToggleFavorite}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <Icon icon="lucide:heart" className={cn("size-6", isFavorited && "text-red-500")} />
            </Button>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-12rem)]">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
