import { Icon } from "@iconify/react";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CommentThread } from "@/components/pages/feed/comment-thread.tsx";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/post/$id")({
  component: RouteComponent,
});

function SpoilerTag({ children }: { children: string }) {
  const [revealed, setRevealed] = useState(false);
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => setRevealed(!revealed)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-200 ${
        revealed
          ? "bg-transparent text-foreground hover:bg-accent/10"
          : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {revealed ? (
        <>
          <Icon icon={"lucide:eye"} className="w-3.5 h-3.5" />
          <span className="text-sm">{children}</span>
        </>
      ) : (
        <>
          <Icon icon={"lucide:eye-off"} className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{t("feed:spoiler")}</span>
        </>
      )}
    </button>
  );
}

function RouteComponent() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(234);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto">
      <article className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border/50 px-4">
        <div className="py-3 border-b border-border/50 flex items-center gap-3">
          <Avatar className="size-9">
            <Image
              className="aspect-square size-full"
              src="https://github.com/shadcn.png"
              width={36}
              height={36}
              alt="@username"
            />
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold leading-none">@username</p>
            <span className="text-xs text-muted-foreground">2 days ago</span>
          </div>
        </div>

        <div className="py-4 border-t border-border/50 prose prose-sm prose-invert max-w-none">
          <p className="text-sm leading-relaxed">
            This is an amazing anime that exceeded all my expectations. The story is compelling and the characters are
            well-developed. <SpoilerTag>The twist at the end was shocking!</SpoilerTag>
          </p>
          <p className="text-sm leading-relaxed mt-3">
            The animation quality is <strong className="text-primary">exceptional</strong>, with{" "}
            <em className="text-muted-foreground">beautiful</em> cinematography throughout. Every episode keeps you
            engaged and wanting more.
          </p>
          <div className="mt-3 p-3 bg-muted/10 rounded-lg border-l-4 border-primary/50">
            <p className="text-xs text-muted-foreground mb-1.5">⚠️ Note from reviewer</p>
            <p className="text-sm">
              However, <SpoilerTag>the main character's sacrifice in episode 12 felt rushed</SpoilerTag> and could have
              been better developed. Overall, I highly recommend this series to anyone who enjoys action and drama.
            </p>
          </div>
        </div>

        <div className="py-3 border-t border-border/50 flex gap-2">
          <Button variant={liked ? "default" : "outline"} size="sm" onClick={handleLike} className="gap-2">
            <Icon icon={"lucide:heart"} className={`size-3.5 ${liked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Icon icon={"lucide:share"} className="size-3.5" />
            {t("feed:share")}
          </Button>
        </div>
        <CommentThread />
      </article>
    </div>
  );
}
