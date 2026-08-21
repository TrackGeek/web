import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMissionsByUserId } from "@/hooks/mission";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";

interface UserMissionsTabProps {
  userId: string;
}

const TIER_ORDER: ApiTypes.MissionTier[] = ["Bronze", "Silver", "Gold", "Platinum"];

const TIER_STYLE: Record<ApiTypes.MissionTier, { icon: string; color: string }> = {
  Bronze: { icon: "lucide:medal", color: "text-orange-400" },
  Silver: { icon: "lucide:medal", color: "text-slate-300" },
  Gold: { icon: "lucide:medal", color: "text-yellow-400" },
  Platinum: { icon: "lucide:gem", color: "text-cyan-300" },
};

function MissionCard({ mission }: { mission: ApiTypes.Mission }) {
  const { t, i18n } = useTranslation();

  const isCompleted = mission.completedAt !== null;
  const masked = mission.hidden && !isCompleted;

  const name = masked ? t("missions:hidden.name") : t(`missions:${mission.key}.name`);
  const description = masked ? t("missions:hidden.description") : t(`missions:${mission.key}.description`);

  return (
    <Card className={cn("py-0", isCompleted && "border-primary/40 bg-primary/5")}>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon
              icon={masked ? "lucide:lock" : isCompleted ? "lucide:badge-check" : "lucide:target"}
              className={cn("size-5 shrink-0", isCompleted ? "text-primary" : "text-muted-foreground")}
            />
            <span className="font-semibold truncate">{name}</span>
          </div>

          {!mission.hidden && mission.medal && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/70">
                  <Image
                    src={mission.medal.imageUrl}
                    width={24}
                    height={24}
                    alt={mission.medal.name}
                    className="size-6"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-muted">
                <div className="text-xs">{t(`medals:${mission.medal.name}.name`)}</div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

        {!masked && (
          <>
            <div className="flex flex-col gap-1">
              <Progress value={mission.percentage} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t("missions:progress", { progress: mission.progress, target: mission.target })}</span>
                <span>{mission.percentage}%</span>
              </div>
            </div>

            {!mission.hidden && (
              <div className="flex flex-wrap items-center gap-1.5">
                {mission.xpReward > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Icon icon="lucide:sparkles" className="size-3" />
                    {t("missions:rewardXp", { count: mission.xpReward })}
                  </Badge>
                )}

                {mission.coinReward > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Icon icon="lucide:coins" className="size-3 text-yellow-400" />
                    {t("missions:rewardCoins", { count: mission.coinReward })}
                  </Badge>
                )}

                {mission.cosmeticKey && (
                  <Badge variant="secondary" className="gap-1">
                    <Icon icon="lucide:palette" className="size-3" />
                    {t(`cosmetics:colors.${mission.cosmeticKey}`)}
                  </Badge>
                )}
              </div>
            )}
          </>
        )}

        {isCompleted && mission.completedAt && (
          <span className="text-xs text-primary">
            {t("missions:completedAt", { date: new Date(mission.completedAt).toLocaleDateString(i18n.language) })}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export function UserMissionsTab({ userId }: UserMissionsTabProps) {
  const { t } = useTranslation();

  const { data: missions, isLoading } = useMissionsByUserId(userId);

  if (isLoading || !missions) {
    return (
      <div className="flex flex-col gap-5">
        {[0, 1].map((group) => (
          <div key={group} className="flex flex-col gap-3">
            <Skeleton className="h-6 w-32" />
            <Grid minColSize={"280px"} autoFit>
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} className="h-40 rounded-xl" />
              ))}
            </Grid>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t("missions:description")}</p>

        <Badge variant="secondary" className="gap-1">
          <Icon icon="lucide:badge-check" className="size-3" />
          {t("missions:completed", { completed: missions.completed, total: missions.total })}
        </Badge>
      </div>

      {TIER_ORDER.map((tier) => {
        const items = missions.items.filter((mission) => mission.tier === tier);

        if (items.length === 0) {
          return null;
        }

        return (
          <div key={tier} className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <Icon icon={TIER_STYLE[tier].icon} className={cn("size-5", TIER_STYLE[tier].color)} />
              {t(`missions:tiers.${tier}`)}
            </h3>

            <Grid minColSize={"280px"} autoFit>
              {items.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </Grid>
          </div>
        );
      })}
    </div>
  );
}
