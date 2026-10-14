import { Icon } from "@iconify/react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Markdown } from "@/components/shared/comments/markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useFeedComposer } from "@/hooks/use-feed-composer";
import { cn } from "@/lib/utils";
import { ComposerToolbar } from "./composer-toolbar";

export const POST_MAX_LENGTH = 20000;

export function FeedComposer() {
  const { t } = useTranslation();
  const id = useId();
  const composer = useFeedComposer(POST_MAX_LENGTH);
  const { user } = composer;

  if (!user) return null;

  return (
    <Card className="@container mb-3 min-w-0 gap-0 border-border/60 p-0 shadow-none">
      <CardContent className="p-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            composer.submit();
          }}
          onKeyDown={(event) => {
            if (
              event.target === composer.editorRef.current &&
              event.key === "Enter" &&
              (event.metaKey || event.ctrlKey) &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              composer.submit();
            }
          }}
          aria-busy={composer.isPending}
          className="min-w-0"
        >
          <div className="min-w-0 px-3 py-2 @sm:px-4">
            {composer.isPreviewing ? (
              <section
                aria-label={t("common:preview")}
                className="max-h-[50dvh] min-h-16 min-w-0 overflow-auto rounded-md px-1 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Markdown className="text-base text-card-foreground [overflow-wrap:anywhere] [&_pre]:max-w-full [&_table]:block [&_table]:overflow-x-auto">
                  {composer.trimmed}
                </Markdown>
              </section>
            ) : (
              <Textarea
                ref={composer.editorRef}
                value={composer.content}
                onChange={(event) => composer.updateContent(event.target.value)}
                placeholder={t("feed:postPlaceholder")}
                aria-label={t("feed:postPlaceholder")}
                aria-describedby={`${id}-hint ${id}-count${composer.status ? ` ${id}-status` : ""}`}
                maxLength={POST_MAX_LENGTH}
                disabled={composer.isPending}
                rows={2}
                className="max-h-[50dvh] min-h-16 resize-none overflow-y-auto border-transparent bg-transparent px-1 py-2 text-base leading-relaxed shadow-none transition-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring md:text-base"
              />
            )}
          </div>

          {composer.status && (
            <p
              id={`${id}-status`}
              role={composer.isError ? "alert" : "status"}
              className={cn(
                "flex items-start gap-2 px-4 pb-3 text-sm",
                composer.isError ? "text-destructive" : "text-muted-foreground",
              )}
            >
              <Icon
                icon={composer.isError ? "lucide:circle-alert" : "lucide:check"}
                className="mt-0.5 size-4 shrink-0"
                aria-hidden
              />
              {composer.status}
            </p>
          )}

          <ComposerToolbar
            id={id}
            media={composer.media}
            onMediaChange={composer.setMedia}
            isSpoiler={composer.isSpoiler}
            onSpoilerChange={composer.setIsSpoiler}
            contentLength={composer.content.length}
            maxLength={POST_MAX_LENGTH}
            canSubmit={composer.canSubmit}
            isPending={composer.isPending}
            isError={composer.isError}
            isPreviewing={composer.isPreviewing}
            onPreviewChange={() => composer.setIsPreviewing((value) => !value)}
            canPreview={composer.trimmed.length > 0}
          />
        </form>
      </CardContent>
    </Card>
  );
}
