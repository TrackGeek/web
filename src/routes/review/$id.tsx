import { Icon } from "@iconify/react";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RatingGroupAdvanced } from "@/components/ui/rating-group-advanced.tsx";

export const Route = createFileRoute("/review/$id")({
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
          <Icon icon={"lucide:eye"} className="size-3.5" />
          <span className="text-sm">{children}</span>
        </>
      ) : (
        <>
          <Icon icon={"lucide:eye-off"} className="size-3.5" />
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
            <div className="flex items-center gap-1.5">
              <Icon icon={"lucide:film"} className="size-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("common:anime")}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">2 days ago</span>
            </div>
          </div>
        </div>

        <div className="py-4 flex gap-4">
          <div className="relative shrink-0 w-24 rounded-lg overflow-hidden shadow-md aspect-2/3">
            <Image
              src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx179062-pbzYE1miZq61.png"
              width={1024}
              height={500}
              alt="Demon Slayer - Kimetsu no Yaiba cover"
              className={`size-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="eager"
              decoding="sync"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                <div className="size-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-2.5 min-w-0">
            <div>
              <h1 className="text-xl font-bold leading-tight">Kimetsu No Yaiba</h1>
              <p className="text-xs text-muted-foreground mt-0.5">26 {t("library:episode_other")} · 2019</p>
            </div>
            <div className="flex items-center gap-2">
              <RatingGroupAdvanced
                readOnly={true}
                value={overallRating.toString()}
                allowHalf={true}
                max={5}
                className="opacity-100 [&>svg]:opacity-100 [&>svg]:w-4 [&>svg]:h-4"
              />
              <span className="text-sm font-semibold tabular-nums">{overallRating}</span>
            </div>
          </div>
        </div>

        <div className="pb-4 grid grid-cols-2 gap-2">
          <CriteriaRating label="Story" value={criteriaRatings.story} />
          <CriteriaRating label="Animation" value={criteriaRatings.animation} />
          <CriteriaRating label="Sound" value={criteriaRatings.sound} />
          <CriteriaRating label="Characters" value={criteriaRatings.characters} />
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
      </article>
    </div>
  );
}
