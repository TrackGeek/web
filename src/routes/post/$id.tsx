import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CommentThread } from "@/components/pages/feed/comment-thread.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
          <Eye className="w-3.5 h-3.5" />
          <span className="text-sm">{children}</span>
        </>
      ) : (
        <>
          <EyeOff className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{t("feed:spoiler")}</span>
        </>
      )}
    </button>
  );
}

function CriteriaRating({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <span className="text-xs font-semibold tabular-nums">{value}</span>
      </div>
      <div className="flex gap-1">
        {[...Array(max)].map((_, i) => {
          const full = i < Math.floor(value);
          const half = !full && i < value;
          return (
            <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-primary-foreground">
              {full && <div className="h-full w-full bg-primary" />}
              {half && <div className="h-full w-1/2 bg-primary" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RouteComponent() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(234);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const criteriaRatings = {
    story: 2.5,
    animation: 5,
    sound: 4,
    characters: 4.5,
  };

  const overallRating = 4.5;

  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto">
      <article className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border/50 px-4">
        <div className="py-3 border-b border-border/50 flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src="https://github.com/shadcn.png" alt="@username" />
            <AvatarFallback>UN</AvatarFallback>
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
            <Heart className={`size-3.5 ${liked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="size-3.5" />
            {t("feed:share")}
          </Button>
        </div>
        <CommentThread />
      </article>
    </div>
  );
}
