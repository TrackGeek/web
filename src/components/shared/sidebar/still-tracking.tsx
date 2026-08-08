import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { CardItem } from "@/components/shared/cards/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentTypes } from "@/hooks/content-type";
import { useActiveProgress } from "@/hooks/progress";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";

const PREVIEW_LIMIT = 6;

interface TrackingPanelProps {
  title: string;
  icon: string;
  types: [ApiTypes.ReviewContentType, ApiTypes.ReviewContentType];
  userId: string;
  username: string;
}

function TrackingPanel({ title, icon, types, userId, username }: TrackingPanelProps) {
  const { t } = useTranslation();

  const { isVisible } = useContentTypes();

  const [primaryType, secondaryType] = types;
  const isPrimaryVisible = isVisible(primaryType);
  const isSecondaryVisible = isVisible(secondaryType);

  const primary = useActiveProgress(primaryType, isPrimaryVisible ? userId : "", PREVIEW_LIMIT);
  const secondary = useActiveProgress(secondaryType, isSecondaryVisible ? userId : "", PREVIEW_LIMIT);

  const isLoading = (isPrimaryVisible && primary.isPending) || (isSecondaryVisible && secondary.isPending);
  const items = [...(primary.data ?? []), ...(secondary.data ?? [])].slice(0, PREVIEW_LIMIT);

  if (!isLoading && items.length === 0) return null;

  return (
    <section
      className={cn(
        "bg-border/30 backdrop-blur border border-border w-full p-3 gap-3 flex flex-col rounded-xl",
        !isPrimaryVisible && !isSecondaryVisible && "hidden",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-bold">
          <Icon icon={icon} className="size-4 text-muted-foreground" />
          {title}
        </span>

        <Link
          to="/user/$username"
          params={{ username }}
          search={{ tab: "progress" }}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {t("pages:donate.viewAll")}
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {isLoading
          ? Array.from({ length: PREVIEW_LIMIT }, (_, index) => (
              <Skeleton key={index} className="aspect-3/4 w-full rounded-lg" />
            ))
          : items.map((item) => (
              <CardItem
                key={item.id}
                title={item.title}
                url={`/${item.contentType}/${item.slug}`}
                imageURL={item.image || null}
              />
            ))}
      </div>
    </section>
  );
}

interface StillTrackingProps {
  userId: string;
  username: string;
}

export function StillWatching({ userId, username }: StillTrackingProps) {
  const { t } = useTranslation();

  return (
    <TrackingPanel
      title={t("library:stillWatching")}
      icon="lucide:play"
      types={["anime", "tv"]}
      userId={userId}
      username={username}
    />
  );
}

export function StillReading({ userId, username }: StillTrackingProps) {
  const { t } = useTranslation();

  return (
    <TrackingPanel
      title={t("library:stillReading")}
      icon="lucide:book-open-text"
      types={["manga", "book"]}
      userId={userId}
      username={username}
    />
  );
}
