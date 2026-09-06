import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Markdown } from "@/components/shared/comments/markdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "@/hooks/post";
import { useSession } from "@/lib/auth/client";
import { CONTENT_TYPE_API } from "@/lib/content-types";
import { cn, getInitialsFromName } from "@/lib/utils";
import { type AttachedMedia, MediaPicker } from "./media-picker";

export const POST_MAX_LENGTH = 20000;

const NEAR_LIMIT_RATIO = 0.9;

export function FeedComposer() {
  const { t } = useTranslation();
  const session = useSession();
  const spoilerId = useId();

  const [content, setContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [media, setMedia] = useState<AttachedMedia | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const user = session.data?.user;
  const createPost = useCreatePost(user?.id);

  if (!user) return null;

  const trimmed = content.trim();
  const canSubmit = trimmed.length > 0 && content.length <= POST_MAX_LENGTH && !createPost.isPending;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!canSubmit) return;

    createPost.mutate(
      {
        content: trimmed,
        isSpoiler,
        ...(media && { mediaType: CONTENT_TYPE_API[media.type], mediaExternalId: media.externalId }),
      },
      {
        onSuccess: () => {
          setContent("");
          setIsSpoiler(false);
          setMedia(null);
          setIsPreviewing(false);
          toast.success(t("feed:postSuccess"));
        },
        onError: () => toast.error(t("feed:postError")),
      },
    );
  }

  return (
    <Card className="mb-3 p-0">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar className="size-9 shrink-0 border border-border">
            {user.profile?.avatarUrl ? (
              <Image
                className="aspect-square size-full"
                src={user.profile.avatarUrl}
                width={36}
                height={36}
                alt={user.name ?? ""}
              />
            ) : (
              <AvatarFallback>{getInitialsFromName(user.name ?? "")}</AvatarFallback>
            )}
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {isPreviewing ? (
              <div className="min-h-24 rounded-md border border-border bg-muted/30 p-3">
                <Markdown>{trimmed}</Markdown>
              </div>
            ) : (
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={t("feed:postPlaceholder")}
                maxLength={POST_MAX_LENGTH}
                disabled={createPost.isPending}
                className="max-h-[60vh] min-h-24 resize-none overflow-y-auto"
              />
            )}

            <div className="flex flex-wrap items-center gap-2">
              <MediaPicker value={media} onChange={setMedia} disabled={createPost.isPending} />

              <label
                htmlFor={spoilerId}
                className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
              >
                <Checkbox
                  id={spoilerId}
                  checked={isSpoiler}
                  onCheckedChange={(checked) => setIsSpoiler(checked === true)}
                  disabled={createPost.isPending}
                />
                {t("feed:spoiler")}
              </label>

              {trimmed.length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsPreviewing((value) => !value)}
                  className="gap-2"
                >
                  <Icon icon={isPreviewing ? "lucide:pencil" : "lucide:eye"} className="size-3.5" />
                  {isPreviewing ? t("feed:edit") : t("common:preview")}
                </Button>
              )}

              <div className="ml-auto flex items-center gap-3">
                <span
                  className={cn(
                    "text-xs text-muted-foreground tabular-nums",
                    content.length >= POST_MAX_LENGTH * NEAR_LIMIT_RATIO && "text-destructive",
                  )}
                >
                  {content.length}/{POST_MAX_LENGTH}
                </span>

                <Button type="submit" size="sm" disabled={!canSubmit} className="gap-2">
                  {t("feed:postSubmit")}
                  <Icon icon="lucide:send" className="size-3" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{t("feed:postMarkdownHint")}</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
