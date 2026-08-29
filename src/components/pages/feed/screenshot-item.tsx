import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ScreenshotGallery, type ScreenshotImage } from "@/components/shared/cards/screenshot";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";
import { parseVideoUrl, videoProviderIcon, videoThumbnailUrl } from "@/lib/utils/video";
import type { FeedProfile, FeedScreenshotData } from "./normalize";
import { ActivityReactions } from "./reactions";

const PREVIEW_LIMIT = 4;

interface ScreenshotActivityItemProps {
  profile: FeedProfile;
  item: FeedScreenshotData;
  onReact?: (emoji: string, currentReaction?: ApiTypes.ActivityReaction) => void;
  isReacting?: boolean;
}

export function ScreenshotActivityItem({ profile, item, onReact, isReacting = false }: ScreenshotActivityItemProps) {
  const { i18n } = useTranslation();

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<string[]>([]);

  const previews = item.screenshots.slice(0, PREVIEW_LIMIT);
  const remaining = item.screenshots.length - previews.length;

  const highlightClass = "font-bold text-foreground hover:text-primary transition-colors";
  const highlight =
    item.titleLink && item.titleLink.to !== "/user/$username" ? (
      <Link to={item.titleLink.to} params={item.titleLink.params} className={highlightClass} />
    ) : (
      <strong />
    );

  return (
    <Card className="p-0 overflow-hidden">
      <CardContent className="flex flex-col p-0">
        <div className="flex items-start justify-between gap-3 p-4 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col min-w-0">
              <span className="text-md font-semibold capitalize">
                <Trans i18nKey={item.titleKey} values={item.titleValues} components={{ strong: highlight }} />
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground whitespace-nowrap">{item.time.toLocaleString(i18n.language)}</p>
        </div>

        <div className={cn("grid gap-1 bg-muted/30", previews.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {previews.map((screenshot, index) => (
            <ScreenshotTile
              key={screenshot.id}
              screenshot={screenshot}
              title={item.mediaTitle ?? ""}
              className={cn(previews.length === 3 && index === 0 && "col-span-2")}
              isRevealed={!screenshot.isSpoiler || revealed.includes(screenshot.id)}
              overlayCount={index === previews.length - 1 && remaining > 0 ? remaining : 0}
              onReveal={() => setRevealed((prev) => [...prev, screenshot.id])}
              onOpen={() => setOpenIndex(index)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 p-4 pt-3">
          <Link to="/user/$username" params={{ username: profile.username ?? "" }} className="flex items-center gap-2">
            <Avatar size="sm">
              {profile.avatarURL ? (
                <Image
                  src={profile.avatarURL}
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-full object-cover"
                  alt={profile.name}
                />
              ) : (
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>

            <p className="text-sm font-bold text-muted-foreground">{profile.name}</p>
          </Link>
          <ActivityReactions
            activityId={item.activityId}
            reactions={item.reactions}
            likes={item.likes}
            onReact={onReact}
            isReacting={isReacting}
          />
        </div>
      </CardContent>

      <ScreenshotGallery
        title={item.mediaTitle ?? ""}
        images={item.screenshots}
        open={openIndex !== null}
        onOpenChange={(open) => !open && setOpenIndex(null)}
        startIndex={openIndex ?? 0}
      />
    </Card>
  );
}

interface ScreenshotTileProps {
  screenshot: ScreenshotImage;
  title: string;
  className?: string;
  isRevealed: boolean;
  overlayCount: number;
  onReveal: () => void;
  onOpen: () => void;
}

function ScreenshotTile({
  screenshot,
  title,
  className,
  isRevealed,
  overlayCount,
  onReveal,
  onOpen,
}: ScreenshotTileProps) {
  const { t } = useTranslation();

  const video = screenshot.type === "Video" ? parseVideoUrl(screenshot.url) : null;
  const source = video ? videoThumbnailUrl(video) : screenshot.url;

  return (
    <button
      type="button"
      onClick={() => (isRevealed ? onOpen() : onReveal())}
      aria-label={isRevealed ? title : t("comments:spoilerReveal")}
      className={cn("relative aspect-video w-full overflow-hidden bg-neutral-950 cursor-pointer group", className)}
    >
      {source ? (
        <Image
          src={source}
          layout="fullWidth"
          aspectRatio={16 / 9}
          alt={screenshot.description ?? title}
          className={cn(
            "size-full object-cover transition-all duration-300 group-hover:scale-105",
            !isRevealed && "blur-xl",
          )}
        />
      ) : (
        <span className="flex size-full items-center justify-center">
          <Icon icon={video ? videoProviderIcon(video.provider) : "lucide:image"} className="size-10 text-white/70" />
        </span>
      )}

      {!isRevealed && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 text-sm font-medium text-white">
          <Icon icon="lucide:eye-off" className="size-4" />
          {t("comments:spoilerReveal")}
        </span>
      )}

      {isRevealed && video && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Icon icon="lucide:play" className="size-10 text-white" />
        </span>
      )}

      {isRevealed && overlayCount > 0 && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl font-semibold text-white">
          +{overlayCount}
        </span>
      )}
    </button>
  );
}
