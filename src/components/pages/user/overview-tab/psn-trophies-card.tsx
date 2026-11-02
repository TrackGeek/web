import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePsnTrophies, useRefreshPsnTrophies } from "@/hooks/psn";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";
import { apiErrorMessage } from "@/lib/utils/api-error";
import { formatRelativeTime } from "@/lib/utils/date";

const TROPHY_GRADES = [
  { key: "platinum", label: "missions:tiers.Platinum", color: "text-sky-300" },
  { key: "gold", label: "missions:tiers.Gold", color: "text-yellow-400" },
  { key: "silver", label: "missions:tiers.Silver", color: "text-zinc-300" },
  { key: "bronze", label: "missions:tiers.Bronze", color: "text-amber-600" },
] as const satisfies ReadonlyArray<{ key: keyof ApiTypes.PsnTrophyCounts; label: string; color: string }>;

const COMPLETED_PROGRESS = 100;

function usePsnFormatters() {
  const { i18n } = useTranslation();

  return useMemo(
    () => ({
      number: new Intl.NumberFormat(i18n.language),
      percent: new Intl.NumberFormat(i18n.language, { style: "percent" }),
    }),
    [i18n.language],
  );
}

interface PsnTrophiesCardProps {
  userId: string;
  isOwner: boolean;
}

export function PsnTrophiesCard({ userId, isOwner }: PsnTrophiesCardProps) {
  const { t } = useTranslation();

  const trophiesQuery = usePsnTrophies(userId);

  const trophies = trophiesQuery.data;

  if (!trophiesQuery.isPending && !trophies?.summary && !isOwner) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Icon icon="simple-icons:playstation" className="size-5 shrink-0" />

            <span className="truncate">{t("user:psnTrophies")}</span>
          </div>

          {trophies?.summary && <PsnTrophiesRefresh userId={userId} isOwner={isOwner} updatedAt={trophies.updatedAt} />}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {trophiesQuery.isPending ? (
          <PsnTrophiesSkeleton />
        ) : trophies?.summary && trophies.profile ? (
          <>
            <PsnTrophySummary profile={trophies.profile} summary={trophies.summary} />

            {trophies.recentTitles.length > 0 && <PsnRecentTitles titles={trophies.recentTitles} />}
          </>
        ) : (
          <PsnTrophiesEmpty trophies={trophies} />
        )}
      </CardContent>
    </Card>
  );
}

interface PsnTrophiesRefreshProps {
  userId: string;
  isOwner: boolean;
  updatedAt: string | null;
}

function PsnTrophiesRefresh({ userId, isOwner, updatedAt }: PsnTrophiesRefreshProps) {
  const { t, i18n } = useTranslation();

  const refreshTrophies = useRefreshPsnTrophies(userId);

  const updatedAgo = updatedAt ? formatRelativeTime(updatedAt, i18n.language) : null;

  async function handleRefresh() {
    try {
      await refreshTrophies.mutateAsync();

      toast.success(t("user:psn.refreshed"));
    } catch (error) {
      toast.error(apiErrorMessage(t, error));
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      {updatedAgo && (
        <span className="text-xs font-normal text-muted-foreground">
          {t("user:psn.updatedAt", { time: updatedAgo })}
        </span>
      )}

      {isOwner && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={refreshTrophies.isPending}
              aria-label={t("user:psn.refresh")}
              onClick={handleRefresh}
            >
              <Icon icon="lucide:refresh-cw" className={cn("size-3.5", refreshTrophies.isPending && "animate-spin")} />
            </Button>
          </TooltipTrigger>

          <TooltipContent side="bottom">{t("user:psn.refresh")}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

interface PsnTrophySummaryProps {
  profile: ApiTypes.PsnProfile;
  summary: ApiTypes.PsnTrophySummary;
}

function PsnTrophySummary({ profile, summary }: PsnTrophySummaryProps) {
  const { t } = useTranslation();

  const formatters = usePsnFormatters();

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-blue-500/25 bg-linear-to-br from-blue-500/15 to-transparent p-4 md:flex-row md:items-center md:gap-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            width={56}
            height={56}
            alt={profile.onlineId}
            className="size-14 shrink-0 rounded-full object-cover ring-2 ring-blue-500/40"
          />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-300 ring-2 ring-blue-500/40">
            <Icon icon="simple-icons:playstation" className="size-6" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 items-baseline justify-between gap-3">
            <p className="truncate font-semibold">{profile.onlineId}</p>

            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {t("xp:levelShort", { level: summary.level })}
            </span>
          </div>

          <Progress value={summary.progress} className="h-1.5" />

          <p className="text-[11px] tabular-nums text-muted-foreground">
            {t("user:psn.nextLevel", {
              progress: formatters.percent.format(summary.progress / 100),
              level: summary.level + 1,
            })}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-4 gap-x-3 md:gap-x-6 md:border-l md:border-blue-500/20 md:pl-6">
        {TROPHY_GRADES.map((grade) => (
          <div key={grade.key} className="flex flex-col-reverse items-center gap-0.5 md:items-start">
            <dt className="text-[11px] text-muted-foreground">{t(grade.label)}</dt>

            <dd className="flex items-center gap-1.5 text-lg font-semibold tabular-nums">
              <Icon icon="lucide:trophy" className={cn("size-4", grade.color)} />

              {formatters.number.format(summary.earnedTrophies[grade.key])}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PsnRecentTitles({ titles }: { titles: ApiTypes.PsnTrophyTitle[] }) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-sm font-medium text-muted-foreground">{t("user:psn.recentGames")}</h3>

      <ul className="flex flex-col divide-y divide-muted">
        {titles.map((title) => (
          <PsnTitleRow key={title.npCommunicationId} title={title} />
        ))}
      </ul>
    </section>
  );
}

function PsnTitleRow({ title }: { title: ApiTypes.PsnTrophyTitle }) {
  const { t, i18n } = useTranslation();

  const formatters = usePsnFormatters();

  const isCompleted = title.progress >= COMPLETED_PROGRESS;
  const platforms = title.platform.split(",");
  const earnedGrades = TROPHY_GRADES.filter((grade) => title.earnedTrophies[grade.key] > 0);
  const lastEarnedAt = formatRelativeTime(title.lastUpdatedAt, i18n.language);

  return (
    <li className="flex items-center gap-3 py-3 sm:gap-4">
      <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={title.iconUrl}
          width={96}
          height={56}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full scale-150 opacity-40 blur-lg"
        />

        <Image
          src={title.iconUrl}
          width={96}
          height={56}
          alt={title.name}
          objectFit="contain"
          className="relative size-full"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="truncate text-sm font-medium" title={title.name}>
          {title.name}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {platforms.map((platform) => (
            <span
              key={platform}
              className="rounded border border-muted px-1.5 text-[10px] font-semibold leading-4 tracking-wide"
            >
              {platform}
            </span>
          ))}

          {earnedGrades.map((grade) => (
            <span key={grade.key} className="flex items-center gap-1 tabular-nums">
              <Icon icon="lucide:trophy" className={cn("size-3.5", grade.color)} aria-label={t(grade.label)} />

              {formatters.number.format(title.earnedTrophies[grade.key])}
            </span>
          ))}

          {lastEarnedAt && <span className="max-sm:hidden">{lastEarnedAt}</span>}
        </div>
      </div>

      <div className="flex w-14 shrink-0 flex-col items-end gap-1.5 sm:w-28">
        <span className={cn("text-sm font-semibold tabular-nums", isCompleted && "text-sky-300")}>
          {formatters.percent.format(title.progress / 100)}
        </span>

        <Progress
          value={title.progress}
          className={cn("h-1.5", isCompleted && "[&>[data-slot=progress-indicator]]:bg-sky-300")}
        />
      </div>
    </li>
  );
}

function PsnTrophiesSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-24 w-full rounded-2xl" />

      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-28" />

        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-14 w-24 shrink-0 rounded-lg" />

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>

            <Skeleton className="h-6 w-14 sm:w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PsnTrophiesEmpty({ trophies }: { trophies: ApiTypes.PsnTrophies | undefined }) {
  const { t } = useTranslation();

  const state = !trophies?.linked ? "notLinked" : trophies.expired ? "expired" : "unavailable";

  return (
    <Empty className="rounded-2xl border border-dashed border-blue-500/25 p-6 md:p-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon icon="simple-icons:playstation" />
        </EmptyMedia>

        <EmptyTitle className="text-base">{t(`user:psn.${state}.title`)}</EmptyTitle>

        <EmptyDescription className="text-xs">{t(`user:psn.${state}.description`)}</EmptyDescription>
      </EmptyHeader>

      {state !== "unavailable" && (
        <Button size="sm" asChild>
          <Link to="/settings" search={{ tab: "connections" }}>
            <Icon icon="lucide:link" className="size-4" />

            {t("settings:connections.connect")}
          </Link>
        </Button>
      )}
    </Empty>
  );
}
