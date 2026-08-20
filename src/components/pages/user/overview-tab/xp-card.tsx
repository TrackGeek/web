import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ApiTypes } from "@/lib/api";

interface XpCardProps {
  xp: ApiTypes.XpSummary;
  coins: ApiTypes.Wallet;
}

const CONTENT_TYPE_CONFIG: Record<ApiTypes.ContentTypeName, { icon: string; label: string; color: string }> = {
  Anime: { icon: "lucide:mountain", label: "common:types.anime_other", color: "text-purple-300" },
  Manga: { icon: "lucide:library-big", label: "common:types.manga_other", color: "text-rose-300" },
  TVShow: { icon: "lucide:tv-minimal-play", label: "common:types.tv_other", color: "text-blue-300" },
  Movie: { icon: "lucide:clapperboard", label: "common:types.movie_other", color: "text-amber-300" },
  Game: { icon: "lucide:gamepad-2", label: "common:types.game_other", color: "text-emerald-300" },
  Book: { icon: "lucide:book", label: "common:types.book_other", color: "text-indigo-300" },
};

function ContentTypeLevel({ entry }: { entry: ApiTypes.ContentLevelProgress }) {
  const { t } = useTranslation();

  const config = CONTENT_TYPE_CONFIG[entry.contentType];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-2">
          <Icon icon={config.icon} className={`size-4 ${config.color}`} />
          <span className="text-xs font-semibold">{t("xp:levelShort", { level: entry.level })}</span>
          <Progress value={entry.percentage} className="h-1" />
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-muted">
        <div className="max-w-xs">
          <div className="font-semibold">{t(config.label)}</div>
          <div className="text-xs text-muted-foreground">{t("xp:totalXp", { count: entry.totalXp })}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function XpCard({ xp, coins }: XpCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:sparkles" className="size-5" />

          {t("xp:progression")}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="text-[10px] font-medium uppercase tracking-wide">{t("xp:level")}</span>
            <span className="text-xl font-bold leading-none">{xp.level}</span>
          </div>

          <div className="flex flex-1 flex-col gap-1.5 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-muted-foreground">{t("xp:totalXp", { count: xp.totalXp })}</span>
            </div>

            <Progress value={xp.percentage} />

            <span className="text-xs text-muted-foreground">
              {xp.nextLevelXp > 0
                ? t("xp:toNextLevel", { current: xp.currentLevelXp, next: xp.nextLevelXp, level: xp.level + 1 })
                : t("xp:maxProgress")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {xp.contentTypes.map((entry) => (
            <ContentTypeLevel key={entry.contentType} entry={entry} />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-sm">
                <Icon icon="lucide:flame" className="size-4 text-orange-400" />
                <span className="font-medium">
                  {xp.currentStreak > 0 ? t("xp:streakDays", { count: xp.currentStreak }) : t("xp:noStreak")}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-muted">
              <div className="text-xs">{t("xp:longestStreak", { count: xp.longestStreak })}</div>
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-1.5 text-sm">
            <Icon icon="lucide:coins" className="size-4 text-yellow-400" />
            <span className="font-medium">{coins.balance}</span>
            <span className="text-muted-foreground">{t("xp:coins")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
