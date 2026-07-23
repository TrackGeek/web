import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MoreOptionsDialogProps {
  title: string;
  coverUrl: string;
  rating: number;
  subtitle: ReactNode;
  description?: string;
  triggerLabel: string;
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
        <Button className="flex bg-transparent items-center justify-center gap-2 w-full py-3 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-all duration-300">
          <Icon icon="lucide:more-horizontal" className="size-5" />
          <span className="text-sm font-medium">{triggerLabel}</span>
        </Button>
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
              <DialogTitle className="text-white font-bold text-lg sm:text-2xl drop-shadow-lg line-clamp-2">
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
                <p className="hidden sm:block text-white/80 text-sm max-w-md line-clamp-2">{description}</p>
              )}
            </div>
          </div>
          <div className="absolute z-50 top-3 right-3 sm:top-[45%] sm:right-10 flex items-center gap-2">
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
