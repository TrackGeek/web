import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";

const COMPLETION_ICONS: Record<ApiTypes.GameCompletion, string> = {
  mainStory: "boxicons:circle-quarter-alt-filled",
  mainStoryPlusExtras: "boxicons:circle-half-alt-filled",
  "100%": "boxicons:circle-filled",
  endless: "lucide:infinity",
};

interface CardProps {
  title: string;
  url: string;
  imageURL?: string | null;
  isAdult?: boolean;
  rating?: number;
  year?: number;
  synopsis?: string;
  mediaType?: string;
  completion?: ApiTypes.GameCompletion | null;
  hoursPlayed?: number | null;
}

export function CardItem(item: CardProps) {
  const { t } = useTranslation();

  const imageURL =
    (item.imageURL ?? null)?.replace(
      "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
      "/placeholder/cover.webp",
    ) ?? "/placeholder/cover.webp";

  const completionIcon = item.completion ? COMPLETION_ICONS[item.completion] : null;
  const completionLabel =
    item.completion && (item.completion === "100%" ? "100%" : t(`feed:completionStatus.${item.completion}`));
  const hasHours = typeof item.hoursPlayed === "number" && item.hoursPlayed > 0;

  return (
    <Link to={item.url} className="space-y-2">
      <div className="relative rounded-lg border border-border overflow-hidden aspect-3/4 group">
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:opacity-80",
            item.isAdult && "blur-md group-hover:blur-none",
          )}
          style={{ backgroundImage: `url("${imageURL}")` }}
        />

        {item.isAdult && (
          <Button variant="destructive" size="xs" className="absolute top-1 left-1 group-hover:opacity-0">
            NSFW
          </Button>
        )}

        {(completionIcon || hasHours) && (
          <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1">
            {completionIcon ? (
              <span
                role="img"
                title={completionLabel || undefined}
                aria-label={completionLabel || undefined}
                className="flex items-center justify-center rounded-md bg-black/70 p-1 text-white backdrop-blur-xs"
              >
                <Icon icon={completionIcon} className="size-3" />
              </span>
            ) : (
              <span />
            )}

            {hasHours && (
              <span className="flex items-center gap-0.5 rounded-md bg-black/70 px-1 py-0.5 text-[10px] font-medium tabular-nums text-white backdrop-blur-xs">
                <Icon icon="lucide:clock" className="size-2.5" />
                {item.hoursPlayed}h
              </span>
            )}
          </div>
        )}
      </div>

      <p className="font-bold text-card-foreground hover:text-primary transition-colors line-clamp-2">{item.title}</p>
    </Link>
  );
}
