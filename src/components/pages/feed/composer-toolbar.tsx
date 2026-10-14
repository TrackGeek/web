import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { type AttachedMedia, MediaPicker } from "./media-picker";

interface ComposerToolbarProps {
  id: string;
  media: AttachedMedia | null;
  onMediaChange: (media: AttachedMedia | null) => void;
  isSpoiler: boolean;
  onSpoilerChange: (value: boolean) => void;
  contentLength: number;
  maxLength: number;
  canSubmit: boolean;
  isPending: boolean;
  isError: boolean;
  isPreviewing: boolean;
  onPreviewChange: () => void;
  canPreview: boolean;
}

export function ComposerToolbar({
  id,
  media,
  onMediaChange,
  isSpoiler,
  onSpoilerChange,
  contentLength,
  maxLength,
  canSubmit,
  isPending,
  isError,
  isPreviewing,
  onPreviewChange,
  canPreview,
}: ComposerToolbarProps) {
  const { t, i18n } = useTranslation();
  const nearLimit = contentLength >= maxLength * 0.9;

  return (
    <div className="min-w-0 border-t border-border/40">
      {media && (
        <div className="px-3 pt-2 @sm:px-4">
          <MediaPicker value={media} onChange={onMediaChange} disabled={isPending} />
        </div>
      )}

      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 px-2 py-1 @2xl:flex-nowrap @sm:px-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {!media && <MediaPicker value={null} onChange={onMediaChange} disabled={isPending} />}

          <label
            htmlFor={`${id}-spoiler`}
            className={cn(
              "flex min-h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-card-foreground active:bg-muted/70 has-focus-visible:ring-2 has-focus-visible:ring-ring",
              isSpoiler && "bg-muted text-card-foreground",
              isPending && "pointer-events-none cursor-not-allowed opacity-50",
            )}
          >
            <Checkbox
              id={`${id}-spoiler`}
              checked={isSpoiler}
              onCheckedChange={(checked) => onSpoilerChange(checked === true)}
              disabled={isPending}
              className="border-muted-foreground transition-none focus-visible:ring-ring"
            />
            {t("feed:spoiler")}
          </label>

          <Button
            type="button"
            variant="ghost"
            onClick={onPreviewChange}
            disabled={!canPreview || isPending}
            aria-label={isPreviewing ? t("feed:edit") : t("common:preview")}
            aria-pressed={isPreviewing}
            className="h-9 min-w-11 gap-2 px-3 text-muted-foreground transition-none hover:bg-muted hover:text-card-foreground focus-visible:ring-ring active:bg-muted/70 aria-pressed:bg-muted aria-pressed:text-card-foreground"
          >
            <Icon icon={isPreviewing ? "lucide:pencil" : "lucide:eye"} className="size-4" aria-hidden />
            <span className="hidden @2xl:inline">{isPreviewing ? t("feed:edit") : t("common:preview")}</span>
          </Button>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-3 @2xl:w-auto @2xl:flex-nowrap">
          <span
            id={`${id}-count`}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground tabular-nums",
              contentLength === 0 && "sr-only",
              nearLimit && "text-destructive",
            )}
          >
            {nearLimit && <Icon icon="lucide:circle-alert" className="size-3.5" aria-hidden />}
            {contentLength.toLocaleString(i18n.language)} / {maxLength.toLocaleString(i18n.language)}
          </span>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-9 min-w-28 gap-2 px-4 transition-none focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:bg-primary/80"
          >
            <span aria-live="polite">
              {isPending ? t("common:loading") : isError ? t("common:tryAgain") : t("feed:postSubmit")}
            </span>
            <Icon icon={isPending ? "lucide:ellipsis" : "lucide:send"} className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <span id={`${id}-hint`} className="sr-only">
        {t("feed:postMarkdownHint")}
      </span>
    </div>
  );
}
